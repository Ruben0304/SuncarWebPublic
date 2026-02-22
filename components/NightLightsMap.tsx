"use client";

import { useEffect, useMemo, useState } from "react";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import L, { type Layer, type PathOptions } from "leaflet";
import { GeoJSON, MapContainer, Marker, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface MunicipioStatApiItem {
  provincia: string;
  municipio: string;
  total_clientes_instalados: number;
  potencia_inversores_kw: number;
  potencia_paneles_kw: number;
  total_kw_instalados: number;
}

interface MunicipioStatsApiResponse {
  success: boolean;
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
}

interface MunicipioAggregate {
  provincia: string;
  municipio: string;
  totalKw: number;
  panelesKw: number;
  inversoresKw: number;
}

interface NightLightsMapProps {
  lightsOn: boolean;
  height?: string;
  onStatsLoaded?: (municipios: number) => void;
}

const ENDPOINT = "/api/clientes/estadisticas/kw-instalados-por-municipio";
const MAP_CENTER: [number, number] = [21.6, -78.8];

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

function buildGlowIcon(point: HeatPoint, index: number, lightsOn: boolean): L.DivIcon {
  const glowSize = 16 + point.intensity * 36;
  const coreSize = 4 + point.intensity * 8;
  const glowOpacity = lightsOn ? 0.2 + point.intensity * 0.7 : 0;
  const pulseDuration = 3.4 - point.intensity * 1.1;
  const pulseDelay = (index % 9) * 0.25;

  return L.divIcon({
    className: "city-light-icon-wrapper",
    iconSize: [glowSize, glowSize],
    iconAnchor: [glowSize / 2, glowSize / 2],
    html: `<div class="city-light-icon ${lightsOn ? "is-on" : "is-off"}" style="--glow-size:${glowSize.toFixed(
      2,
    )}px; --core-size:${coreSize.toFixed(2)}px; --glow-opacity:${glowOpacity.toFixed(
      2,
    )}; --pulse-duration:${pulseDuration.toFixed(2)}s; --pulse-delay:${pulseDelay.toFixed(2)}s;"></div>`,
  });
}

export default function NightLightsMap({
  lightsOn,
  height = "500px",
  onStatsLoaded,
}: NightLightsMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [stats, setStats] = useState<MunicipioStatApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        if (!payload.success || !Array.isArray(payload.data)) {
          throw new Error(payload.message || "Error en datos");
        }

        if (!cancelled) {
          setGeoJsonData(geoJson);
          setStats(payload.data);
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
    return () => { cancelled = true; };
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
      };

      current.totalKw += Number(item.total_kw_instalados || 0);
      current.panelesKw += Number(item.potencia_paneles_kw || 0);
      current.inversoresKw += Number(item.potencia_inversores_kw || 0);
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

  const glowMarkers = useMemo(
    () =>
      heatPoints.map((point, index) => ({
        ...point,
        icon: buildGlowIcon(point, index, lightsOn),
      })),
    [heatPoints, lightsOn],
  );

  const getMunicipioStyle = (feature?: Feature): PathOptions => {
    const shapeName = String(
      (feature?.properties as Record<string, unknown> | undefined)?.shapeName ?? "",
    );
    const point = pointByMunicipio.get(normalizeText(shapeName));
    const ratio = point?.intensity ?? 0;

    if (!lightsOn) {
      return {
        color: "#0f172a",
        weight: 0.8,
        fillColor: "#030712",
        fillOpacity: point ? 0.06 : 0.02,
      };
    }

    if (!point) {
      return {
        color: "rgba(100,116,139,0.22)",
        weight: 0.8,
        fillColor: "#0f172a",
        fillOpacity: 0.03,
      };
    }

    return {
      color: "rgba(251,191,36,0.40)",
      weight: 1.1,
      fillColor: "#f59e0b",
      fillOpacity: Math.min(0.18 + ratio * 0.42, 0.72),
    };
  };

  const onEachMunicipio = (feature: Feature, layer: Layer) => {
    if (!("bindTooltip" in layer)) return;

    const shapeName = String(
      (feature.properties as Record<string, unknown> | undefined)?.shapeName ?? "",
    );
    const point = pointByMunicipio.get(normalizeText(shapeName));

    const tooltipHtml = point
      ? `
      <div class="municipio-tooltip-content">
        <p class="municipio-tooltip-title">${point.municipio}</p>
        <p class="municipio-tooltip-subtitle">${point.provincia}</p>
        <p><span>Paneles:</span> ${point.panelesKw.toFixed(1)} kW</p>
        <p><span>Potencia:</span> ${point.inversoresKw.toFixed(1)} kW</p>
      </div>`
      : `
      <div class="municipio-tooltip-content">
        <p class="municipio-tooltip-title">${shapeName || "Municipio"}</p>
        <p class="municipio-tooltip-empty">Sin instalaciones registradas</p>
      </div>`;

    const interactiveLayer = layer as Layer & {
      bindTooltip: (content: string, options?: L.TooltipOptions) => Layer;
      setStyle?: (style: PathOptions) => void;
      bringToFront?: () => Layer;
      on: Layer["on"];
    };

    interactiveLayer.bindTooltip(tooltipHtml, {
      sticky: true,
      direction: "top",
      opacity: 1,
      className: "municipio-kw-tooltip",
    });

    interactiveLayer.on({
      mouseover: () => {
        interactiveLayer.setStyle?.({
          weight: 1.8,
          color: lightsOn ? "#fde68a" : "#94a3b8",
          fillOpacity: lightsOn ? Math.min((point?.intensity ?? 0.2) + 0.35, 0.8) : 0.12,
        });
        interactiveLayer.bringToFront?.();
      },
      mouseout: () => {
        interactiveLayer.setStyle?.(getMunicipioStyle(feature));
      },
    });
  };

  const totalMunicipios = useMemo(() => {
    const unique = new Set(stats.map((s) => normalizeText(s.municipio)));
    return unique.size;
  }, [stats]);

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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
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

      <div className={`relative transition-[filter] duration-1000 ${
        lightsOn ? "brightness-100 saturate-[1.1]" : "brightness-[0.46] saturate-[0.8]"
      }`}>
        <MapContainer
          center={MAP_CENTER}
          zoom={7}
          minZoom={6}
          maxZoom={10}
          style={{ height, width: "100%" }}
          className="rounded-2xl lg:rounded-3xl"
          scrollWheelZoom={false}
          dragging={true}
          doubleClickZoom={false}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {geoJsonData && (
            <GeoJSON
              key={`${lightsOn}-${heatPoints.length}`}
              data={geoJsonData}
              style={(feature) => getMunicipioStyle(feature as Feature)}
              onEachFeature={(feature, layer) => onEachMunicipio(feature as Feature, layer)}
            />
          )}
          {glowMarkers.map((point) => (
            <Marker
              key={point.key}
              position={[point.lat, point.lng]}
              icon={point.icon}
              interactive={false}
            />
          ))}
        </MapContainer>

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: lightsOn ? 1 : 0.35,
            background:
              "radial-gradient(circle at 28% 22%, rgba(251,191,36,0.22), transparent 40%), radial-gradient(circle at 72% 78%, rgba(251,191,36,0.16), transparent 45%)",
          }}
        />
      </div>

      <div className="pointer-events-none absolute top-4 left-4 z-[1200]">
        <div
          className={`rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-700 ${
            lightsOn
              ? "border-amber-300/60 bg-amber-100/15 shadow-[0_0_25px_rgba(251,191,36,0.32)]"
              : "border-white/20 bg-black/45"
          }`}
        >
          <p className={`text-[11px] uppercase tracking-[0.22em] ${lightsOn ? "text-amber-100/90" : "text-white/55"}`}>
            Hub Solar
          </p>
          <p className={`mt-1 text-3xl font-semibold leading-none ${lightsOn ? "text-amber-50 animate-hub-breathe" : "text-white/70"}`}>
            {totalMunicipios}
          </p>
          <p className={`mt-1 text-xs ${lightsOn ? "text-amber-50/80" : "text-white/55"}`}>
            municipios iluminados
          </p>
        </div>
      </div>

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
          transition: opacity 600ms ease, transform 600ms ease;
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
          background: radial-gradient(circle, rgba(254,243,199,0.9) 0%, rgba(251,191,36,var(--glow-opacity)) 36%, rgba(251,146,60,0.06) 72%, transparent 100%);
          filter: blur(1px);
          animation: cityGlowPulse var(--pulse-duration) ease-in-out infinite;
          animation-delay: var(--pulse-delay);
        }

        .city-light-icon::after {
          width: var(--core-size);
          height: var(--core-size);
          background: #fff7db;
          box-shadow: 0 0 14px rgba(252,211,77,0.95), 0 0 28px rgba(251,191,36,0.65);
        }

        .city-light-icon.is-on {
          opacity: 1;
          transform: scale(1);
        }

        .city-light-icon.is-off {
          opacity: 0;
          transform: scale(0.6);
        }

        .municipio-kw-tooltip .leaflet-tooltip-content {
          margin: 0;
        }

        .municipio-kw-tooltip {
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
          0%, 100% {
            transform: translate(-50%, -50%) scale(0.86);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.18);
            opacity: 1;
          }
        }

        @keyframes hubBreathe {
          0%, 100% {
            text-shadow: 0 0 0 rgba(252, 211, 77, 0.0);
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
