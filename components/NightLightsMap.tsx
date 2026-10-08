"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import GoogleMapView from "@/components/maps/GoogleMapView";
import { ESTILO_OSCURO } from "@/components/maps/dark-style";
import { crearCapaHtml, type CapaHtml } from "@/components/maps/overlays";

interface MunicipioStatApiItem {
  provincia: string;
  municipio: string;
  total_kw_paneles: number;
  total_kw_inversores: number;
  total_kw_baterias: number;
}

interface MunicipioStatsApiResponse {
  success?: boolean;
  message?: string;
  data?: MunicipioStatApiItem[];
  total_municipios?: number;
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

interface MunicipioAggregate {
  provincia: string;
  municipio: string;
  totalKw: number;
  panelesKw: number;
  inversoresKw: number;
  bateriasKw: number;
}

interface NightLightsMapProps {
  lightsOn: boolean;
  height?: string;
  onStatsLoaded?: (municipios: number) => void;
}

// Por la ruta de la propia web (app/api/clientes/estadisticas): el backend solo
// acepta CORS de suncarsrl.com, así que desde localhost o un dominio de prueba
// la llamada directa fallaba con "Failed to fetch".
const ENDPOINT = "/api/clientes/estadisticas/kw-equipos-por-municipio-publico";
const MAP_CENTER = { lat: 21.6, lng: -78.8 };

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getPolygonCentroid(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0];
  let latSum = 0;
  let lngSum = 0;
  for (const coord of ring) {
    lngSum += coord[0];
    latSum += coord[1];
  }
  return [latSum / ring.length, lngSum / ring.length];
}

function getFeatureCentroid(feature: Feature): [number, number] | null {
  const geometry = feature.geometry;
  if (geometry.type === "Polygon") {
    return getPolygonCentroid((geometry as Polygon).coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    const coords = (geometry as MultiPolygon).coordinates;
    let maxLen = 0;
    let maxRing: number[][][] = coords[0];
    for (const poly of coords) {
      if (poly[0].length > maxLen) {
        maxLen = poly[0].length;
        maxRing = poly;
      }
    }
    return getPolygonCentroid(maxRing);
  }
  return null;
}

function glowVars(point: HeatPoint, index: number, lightsOn: boolean) {
  const glowSize = 16 + point.intensity * 36;
  const coreSize = 4 + point.intensity * 8;
  const glowOpacity = lightsOn ? 0.2 + point.intensity * 0.7 : 0;
  const pulseDuration = 3.4 - point.intensity * 1.1;
  const pulseDelay = (index % 9) * 0.25;
  return { glowSize, coreSize, glowOpacity, pulseDuration, pulseDelay };
}

function aplicarGlow(icono: HTMLElement, point: HeatPoint, index: number, lightsOn: boolean) {
  const v = glowVars(point, index, lightsOn);
  icono.className = `city-light-icon ${lightsOn ? "is-on" : "is-off"}`;
  icono.style.cssText = `--glow-size:${v.glowSize.toFixed(2)}px; --core-size:${v.coreSize.toFixed(
    2,
  )}px; --glow-opacity:${v.glowOpacity.toFixed(2)}; --pulse-duration:${v.pulseDuration.toFixed(
    2,
  )}s; --pulse-delay:${v.pulseDelay.toFixed(2)}s;`;
}

interface TooltipEstado {
  x: number;
  y: number;
  point: HeatPoint | null;
  nombre: string;
}

export default function NightLightsMap({
  lightsOn,
  height = "500px",
  onStatsLoaded,
}: NightLightsMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [stats, setStats] = useState<MunicipioStatApiItem[]>([]);
  const [apiTotalMunicipios, setApiTotalMunicipios] = useState<number | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [tooltip, setTooltip] = useState<TooltipEstado | null>(null);
  const contenedor = useRef<HTMLDivElement>(null);
  const glowLayer = useRef<CapaHtml | null>(null);
  const glowNodos = useRef<HTMLElement[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const [geoRes, statsRes] = await Promise.all([
          fetch("/data/cuba-municipios.geojson", { cache: "force-cache" }),
          fetch(ENDPOINT, { cache: "no-store" }),
        ]);

        if (!geoRes.ok) throw new Error("No se pudo cargar el mapa");
        if (!statsRes.ok) throw new Error("No se pudieron cargar los datos");

        const geoJson = (await geoRes.json()) as GeoJsonObject;
        const payload = (await statsRes.json()) as MunicipioStatsApiResponse;

        if (payload.success === false || !Array.isArray(payload.data)) {
          throw new Error(payload.message || "Error en datos");
        }

        if (!cancelled) {
          setGeoJsonData(geoJson);
          setStats(payload.data);
          setApiTotalMunicipios(
            Number.isFinite(payload.total_municipios)
              ? Number(payload.total_municipios)
              : null,
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const municipioAggregates = useMemo(() => {
    const map = new Map<string, MunicipioAggregate>();

    for (const item of stats) {
      const key = normalizeText(item.municipio);
      const current = map.get(key) ?? {
        provincia: item.provincia,
        municipio: item.municipio,
        totalKw: 0,
        panelesKw: 0,
        inversoresKw: 0,
        bateriasKw: 0,
      };

      const panelesKw = Number(item.total_kw_paneles || 0);
      const inversoresKw = Number(item.total_kw_inversores || 0);
      const bateriasKw = Number(item.total_kw_baterias || 0);

      current.panelesKw += panelesKw;
      current.inversoresKw += inversoresKw;
      current.bateriasKw += bateriasKw;
      current.totalKw += panelesKw + inversoresKw + bateriasKw;
      map.set(key, current);
    }

    return map;
  }, [stats]);

  const heatPoints = useMemo<HeatPoint[]>(() => {
    if (!geoJsonData || geoJsonData.type !== "FeatureCollection") return [];

    const maxValue = Math.max(
      ...Array.from(municipioAggregates.values()).map((value) => value.totalKw),
      1,
    );
    const features = (geoJsonData as GeoJSON.FeatureCollection).features;
    const points: HeatPoint[] = [];

    for (const feature of features) {
      const shapeName = String(
        (feature.properties as Record<string, unknown>)?.shapeName ?? "",
      );
      const data = municipioAggregates.get(normalizeText(shapeName));
      if (!data || data.totalKw <= 0) continue;

      const centroid = getFeatureCentroid(feature);
      if (!centroid) continue;

      const intensity = Math.sqrt(data.totalKw / maxValue);
      points.push({
        key: normalizeText(data.municipio),
        lat: centroid[0],
        lng: centroid[1],
        intensity: Math.max(intensity, 0.16),
        provincia: data.provincia,
        municipio: data.municipio,
        totalKw: data.totalKw,
        panelesKw: data.panelesKw,
        inversoresKw: data.inversoresKw,
        bateriasKw: data.bateriasKw,
      });
    }

    return points;
  }, [geoJsonData, municipioAggregates]);

  const pointByMunicipio = useMemo(() => {
    const map = new Map<string, HeatPoint>();
    for (const point of heatPoints) {
      map.set(point.key, point);
    }
    return map;
  }, [heatPoints]);

  const estadoRef = useRef({ lightsOn, pointByMunicipio });
  estadoRef.current = { lightsOn, pointByMunicipio };

  const nombreDe = (feature: google.maps.Data.Feature) =>
    String(feature.getProperty("shapeName") ?? "");

  const estiloMunicipio = (
    feature: google.maps.Data.Feature,
  ): google.maps.Data.StyleOptions => {
    const point = pointByMunicipio.get(normalizeText(nombreDe(feature)));
    const ratio = point?.intensity ?? 0;

    if (!lightsOn) {
      // Apagado: la isla se ve gris y las divisiones de los municipios se leen.
      return {
        strokeColor: "#94a3b8",
        strokeOpacity: point ? 0.6 : 0.42,
        strokeWeight: 0.9,
        fillColor: "#94a3b8",
        fillOpacity: point ? 0.12 : 0.05,
        clickable: true,
      };
    }
    if (!point) {
      return {
        strokeColor: "#64748b",
        strokeOpacity: 0.22,
        strokeWeight: 0.8,
        fillColor: "#0f172a",
        fillOpacity: 0.03,
        clickable: true,
      };
    }
    return {
      strokeColor: "#fbbf24",
      strokeOpacity: 0.4,
      strokeWeight: 1.1,
      fillColor: "#f59e0b",
      fillOpacity: Math.min(0.18 + ratio * 0.42, 0.72),
      clickable: true,
    };
  };

  // Municipios: se cargan una vez y se restilan al prender o apagar las luces.
  useEffect(() => {
    if (!map || !geoJsonData) return;
    const features = map.data.addGeoJson(geoJsonData);
    const escuchas = [
      map.data.addListener("mouseover", (e: google.maps.Data.MouseEvent) => {
        const { lightsOn: on, pointByMunicipio: puntos } = estadoRef.current;
        const point = puntos.get(normalizeText(nombreDe(e.feature)));
        map.data.overrideStyle(e.feature, {
          strokeWeight: 1.8,
          strokeColor: on ? "#fde68a" : "#94a3b8",
          strokeOpacity: 1,
          fillOpacity: on ? Math.min((point?.intensity ?? 0.2) + 0.35, 0.8) : 0.12,
        });
      }),
      map.data.addListener("mousemove", (e: google.maps.Data.MouseEvent) => {
        const caja = contenedor.current?.getBoundingClientRect();
        const evento = e.domEvent as MouseEvent | undefined;
        if (!caja || !evento || typeof evento.clientX !== "number") return;
        const nombre = nombreDe(e.feature);
        setTooltip({
          x: evento.clientX - caja.left,
          y: evento.clientY - caja.top,
          point: estadoRef.current.pointByMunicipio.get(normalizeText(nombre)) ?? null,
          nombre,
        });
      }),
      map.data.addListener("mouseout", (e: google.maps.Data.MouseEvent) => {
        map.data.revertStyle(e.feature);
        setTooltip(null);
      }),
    ];
    return () => {
      escuchas.forEach((l) => l.remove());
      features.forEach((f) => map.data.remove(f));
    };
  }, [map, geoJsonData]);

  useEffect(() => {
    map?.data.setStyle((feature) => estiloMunicipio(feature));
    // el estilo depende de lo prendido y de los datos
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, lightsOn, pointByMunicipio]);

  // Luces de cada municipio: los nodos se crean con los datos y, al prender o
  // apagar, solo cambian de clase para que la transición se vea.
  useEffect(() => {
    if (!map) return;
    const capa = crearCapaHtml(false);
    capa.setMap(map);
    glowLayer.current = capa;
    return () => {
      capa.setMap(null);
      glowLayer.current = null;
    };
  }, [map]);

  useEffect(() => {
    const capa = glowLayer.current;
    if (!capa) return;
    glowNodos.current = heatPoints.map((point, index) => {
      const envoltorio = document.createElement("div");
      envoltorio.className = "city-light-icon-wrapper";
      const icono = document.createElement("div");
      aplicarGlow(icono, point, index, estadoRef.current.lightsOn);
      envoltorio.appendChild(icono);
      return envoltorio;
    });
    capa.setNodos(
      heatPoints.map((point, index) => {
        const tam = glowVars(point, index, true).glowSize;
        return {
          lat: point.lat,
          lng: point.lng,
          el: glowNodos.current[index],
          ancho: tam,
          alto: tam,
        };
      }),
    );
  }, [map, heatPoints]);

  useEffect(() => {
    glowNodos.current.forEach((envoltorio, index) => {
      const icono = envoltorio.firstElementChild as HTMLElement | null;
      if (icono) aplicarGlow(icono, heatPoints[index], index, lightsOn);
    });
  }, [lightsOn, heatPoints]);

  const totalMunicipios = useMemo(() => {
    if (typeof apiTotalMunicipios === "number" && apiTotalMunicipios >= 0) {
      return apiTotalMunicipios;
    }
    const unique = new Set(stats.map((s) => normalizeText(s.municipio)));
    return unique.size;
  }, [apiTotalMunicipios, stats]);

  useEffect(() => {
    if (totalMunicipios > 0 && onStatsLoaded) {
      onStatsLoaded(totalMunicipios);
    }
  }, [totalMunicipios, onStatsLoaded]);

  return (
    <div className="relative isolate overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10">
      {isLoading && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-3"
          style={{ height }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F2C300] border-t-transparent" />
          <p className="text-white/60 text-sm font-medium">Cargando mapa</p>
        </div>
      )}

      {error && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          style={{ height }}
        >
          <p className="text-red-400 text-center text-sm">{error}</p>
        </div>
      )}

      <div
        className={`relative transition-[filter] duration-1000 ${
          lightsOn
            ? "brightness-100 saturate-[1.1]"
            : "brightness-[0.9] saturate-[0.8]"
        }`}
      >
        <div ref={contenedor} className="relative">
          <GoogleMapView
            onMap={setMap}
            className="rounded-2xl bg-[#0A052D] lg:rounded-3xl"
            style={{ height, width: "100%" }}
            options={() => ({
              center: MAP_CENTER,
              zoom: 7,
              minZoom: 6,
              maxZoom: 10,
              styles: ESTILO_OSCURO,
              backgroundColor: "#080808",
              gestureHandling: "cooperative",
              disableDefaultUI: true,
              zoomControl: true,
              zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_BOTTOM,
              },
              keyboardShortcuts: true,
            })}
          />
          {tooltip && (
            <div
              className="municipio-kw-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.point ? (
                <div className="municipio-tooltip-content">
                  <p className="municipio-tooltip-title">{tooltip.point.municipio}</p>
                  <p className="municipio-tooltip-subtitle">{tooltip.point.provincia}</p>
                  <p><span>Paneles:</span> {tooltip.point.panelesKw.toFixed(1)} kW</p>
                  <p><span>Inversores:</span> {tooltip.point.inversoresKw.toFixed(1)} kW</p>
                  <p><span>Baterias:</span> {tooltip.point.bateriasKw.toFixed(1)} kW</p>
                </div>
              ) : (
                <div className="municipio-tooltip-content">
                  <p className="municipio-tooltip-title">{tooltip.nombre || "Municipio"}</p>
                  <p className="municipio-tooltip-empty">Sin instalaciones registradas</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: lightsOn ? 1 : 0.35,
            background:
              "radial-gradient(circle at 28% 22%, rgba(251,191,36,0.22), transparent 40%), radial-gradient(circle at 72% 78%, rgba(251,191,36,0.16), transparent 45%)",
          }}
        />
      </div>

      {lightsOn && (
        <div className="pointer-events-none absolute top-4 left-4 z-[1200]">
          <div
            className="rounded-2xl border border-[#F2C300]/35 bg-[#F2C300]/10 px-4 py-3 backdrop-blur-xl shadow-[0_0_25px_rgba(251,191,36,0.32)] transition-all duration-700"
            aria-label={`${totalMunicipios} municipios encendidos`}
          >
            <p className="text-3xl font-semibold leading-none text-white animate-hub-breathe">
              {totalMunicipios}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/70">
              municipios instalados
            </p>
          </div>
        </div>
      )}

      <style jsx global>{`
        .city-light-icon-wrapper {
          background: transparent;
          border: 0;
        }

        .city-light-icon {
          width: var(--glow-size);
          height: var(--glow-size);
          border-radius: 9999px;
          position: relative;
          transform: translateZ(0);
          transition:
            opacity 600ms ease,
            transform 600ms ease;
          opacity: 0;
        }

        .city-light-icon::before,
        .city-light-icon::after {
          content: "";
          position: absolute;
          inset: 50%;
          border-radius: 9999px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .city-light-icon::before {
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle,
            rgba(254, 243, 199, 0.9) 0%,
            rgba(251, 191, 36, var(--glow-opacity)) 36%,
            rgba(251, 146, 60, 0.06) 72%,
            transparent 100%
          );
          filter: blur(1px);
          animation: cityGlowPulse var(--pulse-duration) ease-in-out infinite;
          animation-delay: var(--pulse-delay);
        }

        .city-light-icon::after {
          width: var(--core-size);
          height: var(--core-size);
          background: #fff7db;
          box-shadow:
            0 0 14px rgba(252, 211, 77, 0.95),
            0 0 28px rgba(251, 191, 36, 0.65);
        }

        .city-light-icon.is-on {
          opacity: 1;
          transform: scale(1);
        }

        .city-light-icon.is-off {
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
          padding: 0;
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

        @keyframes cityGlowPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.86);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.18);
            opacity: 1;
          }
        }

        @keyframes hubBreathe {
          0%,
          100% {
            text-shadow: 0 0 0 rgba(252, 211, 77, 0);
          }
          50% {
            text-shadow: 0 0 18px rgba(252, 211, 77, 0.45);
          }
        }

        .animate-hub-breathe {
          animation: hubBreathe 2.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
