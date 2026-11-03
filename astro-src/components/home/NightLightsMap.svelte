<script lang="ts">
  import { onMount } from "svelte";
  import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
  import { ESTILO_OSCURO } from "@/components/maps/dark-style";
  import { crearCapaHtml, type CapaHtml } from "@/components/maps/overlays";
  import { cargarGoogleMaps, fallaAutenticacion } from "~/lib/googleMaps";

  interface MunicipioStatApiItem {
    provincia: string;
    municipio: string;
    total_kw_paneles: number;
    total_kw_inversores: number;
    total_kw_baterias: number;
  }
  interface HeatPoint {
    key: string;
    lat: number;
    lng: number;
    intensity: number;
    provincia: string;
    municipio: string;
    totalKw: number;
    panelesKw: number;
    inversoresKw: number;
    bateriasKw: number;
  }
  interface Aggregate {
    provincia: string;
    municipio: string;
    totalKw: number;
    panelesKw: number;
    inversoresKw: number;
    bateriasKw: number;
  }

  interface Props {
    lightsOn: boolean;
    height?: string;
    onStatsLoaded?: (municipios: number) => void;
  }
  let { lightsOn, height = "500px", onStatsLoaded }: Props = $props();

  const ENDPOINT = "/api/clientes/estadisticas/kw-equipos-por-municipio-publico";
  const MAP_CENTER = { lat: 21.6, lng: -78.8 };

  const normalizeText = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  function polygonCentroid(coordinates: number[][][]): [number, number] {
    const ring = coordinates[0];
    let lat = 0;
    let lng = 0;
    for (const c of ring) {
      lng += c[0];
      lat += c[1];
    }
    return [lat / ring.length, lng / ring.length];
  }
  function featureCentroid(feature: Feature): [number, number] | null {
    const g = feature.geometry;
    if (g.type === "Polygon") return polygonCentroid((g as Polygon).coordinates);
    if (g.type === "MultiPolygon") {
      const coords = (g as MultiPolygon).coordinates;
      let maxLen = 0;
      let maxRing = coords[0];
      for (const poly of coords) {
        if (poly[0].length > maxLen) {
          maxLen = poly[0].length;
          maxRing = poly;
        }
      }
      return polygonCentroid(maxRing);
    }
    return null;
  }

  function glowVars(p: HeatPoint, index: number, on: boolean) {
    return {
      glowSize: 16 + p.intensity * 36,
      coreSize: 4 + p.intensity * 8,
      glowOpacity: on ? 0.2 + p.intensity * 0.7 : 0,
      pulseDuration: 3.4 - p.intensity * 1.1,
      pulseDelay: (index % 9) * 0.25,
    };
  }
  function aplicarGlow(icono: HTMLElement, p: HeatPoint, index: number, on: boolean) {
    const v = glowVars(p, index, on);
    icono.className = `city-light-icon ${on ? "is-on" : "is-off"}`;
    icono.style.cssText = `--glow-size:${v.glowSize.toFixed(2)}px; --core-size:${v.coreSize.toFixed(2)}px; --glow-opacity:${v.glowOpacity.toFixed(2)}; --pulse-duration:${v.pulseDuration.toFixed(2)}s; --pulse-delay:${v.pulseDelay.toFixed(2)}s;`;
  }

  let geoJsonData: GeoJsonObject | null = $state(null);
  let stats: MunicipioStatApiItem[] = $state([]);
  let apiTotal: number | null = $state(null);
  let isLoading = $state(true);
  let error: string | null = $state(null);
  let map: google.maps.Map | null = $state(null);
  let mapaFalla = $state(false);
  let tooltip: { x: number; y: number; point: HeatPoint | null; nombre: string } | null = $state(null);
  let contenedor: HTMLDivElement | null = $state(null);
  let mapaEl: HTMLDivElement | null = $state(null);

  let glowLayer: CapaHtml | null = null;
  let glowNodos: HTMLElement[] = [];

  onMount(() => {
    let cancelled = false;
    (async () => {
      try {
        const [geoRes, statsRes] = await Promise.all([
          fetch("/data/cuba-municipios.geojson", { cache: "force-cache" }),
          fetch(ENDPOINT, { cache: "no-store" }),
        ]);
        if (!geoRes.ok) throw new Error("No se pudo cargar el mapa");
        if (!statsRes.ok) throw new Error("No se pudieron cargar los datos");
        const geoJson = (await geoRes.json()) as GeoJsonObject;
        const payload = await statsRes.json();
        if (payload.success === false || !Array.isArray(payload.data)) {
          throw new Error(payload.message || "Error en datos");
        }
        if (!cancelled) {
          geoJsonData = geoJson;
          stats = payload.data;
          apiTotal = Number.isFinite(payload.total_municipios) ? Number(payload.total_municipios) : null;
        }
      } catch (err) {
        if (!cancelled) error = err instanceof Error ? err.message : "Error desconocido";
      } finally {
        if (!cancelled) isLoading = false;
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  // Crear el mapa cuando el script de Google está listo
  onMount(() => {
    let cancelado = false;
    let creado: google.maps.Map | null = null;
    (async () => {
      await cargarGoogleMaps();
      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      if (cancelado || !mapaEl) return;
      creado = new Map(mapaEl, {
        center: MAP_CENTER,
        zoom: 7,
        minZoom: 6,
        maxZoom: 10,
        styles: ESTILO_OSCURO,
        backgroundColor: "#080808",
        gestureHandling: "cooperative",
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        keyboardShortcuts: true,
      });
      map = creado;
      setTimeout(() => {
        if (!cancelado && fallaAutenticacion) mapaFalla = true;
      }, 1500);
    })().catch((e) => {
      console.error("[NightLightsMap]", e);
      mapaFalla = true;
    });
    return () => {
      cancelado = true;
      if (creado) google.maps.event.clearInstanceListeners(creado);
      map = null;
    };
  });

  const aggregates = $derived.by(() => {
    const m = new Map<string, Aggregate>();
    for (const item of stats) {
      const key = normalizeText(item.municipio);
      const cur = m.get(key) ?? { provincia: item.provincia, municipio: item.municipio, totalKw: 0, panelesKw: 0, inversoresKw: 0, bateriasKw: 0 };
      const p = Number(item.total_kw_paneles || 0);
      const i = Number(item.total_kw_inversores || 0);
      const b = Number(item.total_kw_baterias || 0);
      cur.panelesKw += p;
      cur.inversoresKw += i;
      cur.bateriasKw += b;
      cur.totalKw += p + i + b;
      m.set(key, cur);
    }
    return m;
  });

  const heatPoints = $derived.by<HeatPoint[]>(() => {
    if (!geoJsonData || geoJsonData.type !== "FeatureCollection") return [];
    const maxValue = Math.max(...Array.from(aggregates.values()).map((v) => v.totalKw), 1);
    const points: HeatPoint[] = [];
    for (const feature of (geoJsonData as GeoJSON.FeatureCollection).features) {
      const shapeName = String((feature.properties as Record<string, unknown>)?.shapeName ?? "");
      const data = aggregates.get(normalizeText(shapeName));
      if (!data || data.totalKw <= 0) continue;
      const centroid = featureCentroid(feature);
      if (!centroid) continue;
      points.push({
        key: normalizeText(data.municipio),
        lat: centroid[0],
        lng: centroid[1],
        intensity: Math.max(Math.sqrt(data.totalKw / maxValue), 0.16),
        ...data,
      });
    }
    return points;
  });

  const pointByMunicipio = $derived(new Map(heatPoints.map((p) => [p.key, p])));

  const nombreDe = (f: google.maps.Data.Feature) => String(f.getProperty("shapeName") ?? "");

  function estiloMunicipio(f: google.maps.Data.Feature): google.maps.Data.StyleOptions {
    const point = pointByMunicipio.get(normalizeText(nombreDe(f)));
    const ratio = point?.intensity ?? 0;
    if (!lightsOn) {
      return { strokeColor: "#94a3b8", strokeOpacity: point ? 0.6 : 0.42, strokeWeight: 0.9, fillColor: "#94a3b8", fillOpacity: point ? 0.12 : 0.05, clickable: true };
    }
    if (!point) {
      return { strokeColor: "#64748b", strokeOpacity: 0.22, strokeWeight: 0.8, fillColor: "#0f172a", fillOpacity: 0.03, clickable: true };
    }
    return { strokeColor: "#fbbf24", strokeOpacity: 0.4, strokeWeight: 1.1, fillColor: "#f59e0b", fillOpacity: Math.min(0.18 + ratio * 0.42, 0.72), clickable: true };
  }

  // Municipios: se cargan una vez y se restilan al prender/apagar
  $effect(() => {
    if (!map || !geoJsonData) return;
    const m = map;
    const features = m.data.addGeoJson(geoJsonData);
    const escuchas = [
      m.data.addListener("mouseover", (e: google.maps.Data.MouseEvent) => {
        const point = pointByMunicipio.get(normalizeText(nombreDe(e.feature)));
        m.data.overrideStyle(e.feature, {
          strokeWeight: 1.8,
          strokeColor: lightsOn ? "#fde68a" : "#94a3b8",
          strokeOpacity: 1,
          fillOpacity: lightsOn ? Math.min((point?.intensity ?? 0.2) + 0.35, 0.8) : 0.12,
        });
      }),
      m.data.addListener("mousemove", (e: google.maps.Data.MouseEvent) => {
        const caja = contenedor?.getBoundingClientRect();
        const ev = e.domEvent as MouseEvent | undefined;
        if (!caja || !ev || typeof ev.clientX !== "number") return;
        const nombre = nombreDe(e.feature);
        tooltip = {
          x: ev.clientX - caja.left,
          y: ev.clientY - caja.top,
          point: pointByMunicipio.get(normalizeText(nombre)) ?? null,
          nombre,
        };
      }),
      m.data.addListener("mouseout", (e: google.maps.Data.MouseEvent) => {
        m.data.revertStyle(e.feature);
        tooltip = null;
      }),
    ];
    return () => {
      escuchas.forEach((l) => l.remove());
      features.forEach((f) => m.data.remove(f));
    };
  });

  $effect(() => {
    if (!map) return;
    // dependencias explícitas: estilo según luces y datos
    void lightsOn;
    void pointByMunicipio;
    map.data.setStyle((f) => estiloMunicipio(f));
  });

  $effect(() => {
    if (!map) return;
    const capa = crearCapaHtml(false);
    capa.setMap(map);
    glowLayer = capa;
    return () => {
      capa.setMap(null);
      glowLayer = null;
    };
  });

  $effect(() => {
    const capa = glowLayer;
    const puntos = heatPoints;
    if (!capa || !map) return;
    glowNodos = puntos.map((point, index) => {
      const envoltorio = document.createElement("div");
      envoltorio.className = "city-light-icon-wrapper";
      const icono = document.createElement("div");
      aplicarGlow(icono, point, index, lightsOn);
      envoltorio.appendChild(icono);
      return envoltorio;
    });
    capa.setNodos(
      puntos.map((point, index) => {
        const tam = glowVars(point, index, true).glowSize;
        return { lat: point.lat, lng: point.lng, el: glowNodos[index], ancho: tam, alto: tam };
      }),
    );
  });

  $effect(() => {
    const on = lightsOn;
    const puntos = heatPoints;
    glowNodos.forEach((envoltorio, index) => {
      const icono = envoltorio.firstElementChild as HTMLElement | null;
      if (icono && puntos[index]) aplicarGlow(icono, puntos[index], index, on);
    });
  });

  const totalMunicipios = $derived(
    typeof apiTotal === "number" && apiTotal >= 0 ? apiTotal : new Set(stats.map((s) => normalizeText(s.municipio))).size,
  );

  $effect(() => {
    if (totalMunicipios > 0) onStatsLoaded?.(totalMunicipios);
  });
</script>

<div class="relative isolate overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10">
  {#if isLoading}
    <div class="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-3" style={`height: ${height}`}>
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-[#F2C300] border-t-transparent"></div>
      <p class="text-white/60 text-sm font-medium">Cargando mapa</p>
    </div>
  {/if}

  {#if error}
    <div class="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4" style={`height: ${height}`}>
      <p class="text-red-400 text-center text-sm">{error}</p>
    </div>
  {/if}

  <div class={`relative transition-[filter] duration-1000 ${lightsOn ? "brightness-100 saturate-[1.1]" : "brightness-[0.9] saturate-[0.8]"}`}>
    <div bind:this={contenedor} class="relative">
      <div class="relative">
        <div bind:this={mapaEl} class="rounded-2xl bg-[#0A052D] lg:rounded-3xl" style={`height: ${height}; width: 100%;`}></div>
        {#if mapaFalla}
          <div class="absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center text-sm text-white">
            No pudimos cargar el mapa. Intenta recargar la página.
          </div>
        {/if}
      </div>
      {#if tooltip}
        <div class="municipio-kw-tooltip" style={`left: ${tooltip.x}px; top: ${tooltip.y}px;`}>
          {#if tooltip.point}
            <div class="municipio-tooltip-content">
              <p class="municipio-tooltip-title">{tooltip.point.municipio}</p>
              <p class="municipio-tooltip-subtitle">{tooltip.point.provincia}</p>
              <p><span>Paneles:</span> {tooltip.point.panelesKw.toFixed(1)} kW</p>
              <p><span>Inversores:</span> {tooltip.point.inversoresKw.toFixed(1)} kW</p>
              <p><span>Baterias:</span> {tooltip.point.bateriasKw.toFixed(1)} kW</p>
            </div>
          {:else}
            <div class="municipio-tooltip-content">
              <p class="municipio-tooltip-title">{tooltip.nombre || "Municipio"}</p>
              <p class="municipio-tooltip-empty">Sin instalaciones registradas</p>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div
      class="pointer-events-none absolute inset-0 transition-opacity duration-1000"
      style={`opacity: ${lightsOn ? 1 : 0.35}; background: radial-gradient(circle at 28% 22%, rgba(251,191,36,0.22), transparent 40%), radial-gradient(circle at 72% 78%, rgba(251,191,36,0.16), transparent 45%);`}
    ></div>
  </div>

  {#if lightsOn}
    <div class="pointer-events-none absolute top-4 left-4 z-[1200]">
      <div
        class="rounded-2xl border border-[#F2C300]/35 bg-[#F2C300]/10 px-4 py-3 backdrop-blur-xl shadow-[0_0_25px_rgba(251,191,36,0.32)] transition-all duration-700"
        aria-label={`${totalMunicipios} municipios encendidos`}
      >
        <p class="text-3xl font-semibold leading-none text-white animate-hub-breathe">{totalMunicipios}</p>
        <p class="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/70">municipios instalados</p>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(.city-light-icon-wrapper) {
    background: transparent;
    border: 0;
  }
  :global(.city-light-icon) {
    width: var(--glow-size);
    height: var(--glow-size);
    border-radius: 9999px;
    position: relative;
    transform: translateZ(0);
    transition: opacity 600ms ease, transform 600ms ease;
    opacity: 0;
  }
  :global(.city-light-icon::before),
  :global(.city-light-icon::after) {
    content: "";
    position: absolute;
    inset: 50%;
    border-radius: 9999px;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  :global(.city-light-icon::before) {
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(254, 243, 199, 0.9) 0%, rgba(251, 191, 36, var(--glow-opacity)) 36%, rgba(251, 146, 60, 0.06) 72%, transparent 100%);
    filter: blur(1px);
    animation: cityGlowPulse var(--pulse-duration) ease-in-out infinite;
    animation-delay: var(--pulse-delay);
  }
  :global(.city-light-icon::after) {
    width: var(--core-size);
    height: var(--core-size);
    background: #fff7db;
    box-shadow: 0 0 14px rgba(252, 211, 77, 0.95), 0 0 28px rgba(251, 191, 36, 0.65);
  }
  :global(.city-light-icon.is-on) {
    opacity: 1;
    transform: scale(1);
  }
  :global(.city-light-icon.is-off) {
    opacity: 0;
    transform: scale(0.6);
  }
  .municipio-kw-tooltip {
    position: absolute;
    z-index: 20;
    pointer-events: none;
    transform: translate(-50%, calc(-100% - 14px));
    border: 1px solid rgba(251, 191, 36, 0.35);
    border-radius: 12px;
    background: rgba(2, 6, 23, 0.94);
    color: #f8fafc;
    box-shadow: 0 10px 30px rgba(2, 6, 23, 0.4);
  }
  .municipio-tooltip-content {
    min-width: 180px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.4;
  }
  .municipio-tooltip-title {
    margin: 0;
    font-size: 13px;
    font-weight: 700;
    color: #fde68a;
  }
  .municipio-tooltip-subtitle {
    margin: 2px 0 8px;
    font-size: 11px;
    color: rgba(248, 250, 252, 0.7);
  }
  .municipio-tooltip-content p {
    margin: 2px 0;
    color: rgba(248, 250, 252, 0.88);
  }
  .municipio-tooltip-content span {
    color: rgba(250, 204, 21, 0.95);
    font-weight: 600;
  }
  .municipio-tooltip-empty {
    margin-top: 6px;
    color: rgba(248, 250, 252, 0.7);
  }
  @keyframes -global-cityGlowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(0.86); opacity: 0.8; }
    50% { transform: translate(-50%, -50%) scale(1.18); opacity: 1; }
  }
  @keyframes hubBreathe {
    0%, 100% { text-shadow: 0 0 0 rgba(252, 211, 77, 0); }
    50% { text-shadow: 0 0 18px rgba(252, 211, 77, 0.45); }
  }
  .animate-hub-breathe {
    animation: hubBreathe 2.8s ease-in-out infinite;
  }
</style>
