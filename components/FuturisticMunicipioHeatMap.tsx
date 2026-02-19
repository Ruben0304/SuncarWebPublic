"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, GeoJsonObject } from "geojson";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { Cpu, Sun, Zap } from "lucide-react";
import "leaflet/dist/leaflet.css";

type MetricKey = "paneles" | "inversores" | "total";

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
}

interface AggregatedMunicipioStat {
  municipio: string;
  provincias: string[];
  total_clientes_instalados: number;
  potencia_inversores_kw: number;
  potencia_paneles_kw: number;
  total_kw_instalados: number;
}

interface HoverInfo {
  municipio: string;
  x: number;
  y: number;
  stat: AggregatedMunicipioStat | null;
}

interface FuturisticMunicipioHeatMapProps {
  endpoint?: string;
  height?: string;
}

const DEFAULT_ENDPOINT = "/api/clientes/estadisticas/kw-instalados-por-municipio";
const CARD_WIDTH = 240;
const CARD_HEIGHT = 160;

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    field:
      | "potencia_paneles_kw"
      | "potencia_inversores_kw"
      | "total_kw_instalados";
    icon: typeof Sun;
  }
> = {
  paneles: {
    label: "Paneles",
    field: "potencia_paneles_kw",
    icon: Sun,
  },
  inversores: {
    label: "Inversores",
    field: "potencia_inversores_kw",
    icon: Cpu,
  },
  total: {
    label: "Total",
    field: "total_kw_instalados",
    icon: Zap,
  },
};

const mapCenter: [number, number] = [21.5218, -77.7812];

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatMetric(value: number): string {
  return new Intl.NumberFormat("es-CU", {
    maximumFractionDigits: value > 100 ? 0 : 2,
  }).format(value);
}

function heatColorFromRatio(ratio: number): string {
  if (ratio <= 0) return "#dbeafe";
  if (ratio < 0.2) return "#93c5fd";
  if (ratio < 0.4) return "#60a5fa";
  if (ratio < 0.6) return "#38bdf8";
  if (ratio < 0.78) return "#22d3ee";
  if (ratio < 0.9) return "#facc15";
  return "#f97316";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function FuturisticMunicipioHeatMap({
  endpoint = DEFAULT_ENDPOINT,
  height = "620px",
}: FuturisticMunicipioHeatMapProps) {
  const mapShellRef = useRef<HTMLDivElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("paneles");
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [stats, setStats] = useState<MunicipioStatApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [geoJsonResponse, statsResponse] = await Promise.all([
          fetch("/data/cuba-municipios.geojson", { cache: "force-cache" }),
          fetch(endpoint, { cache: "no-store" }),
        ]);

        if (!geoJsonResponse.ok) {
          throw new Error("No se pudo cargar el GeoJSON de municipios");
        }

        if (!statsResponse.ok) {
          throw new Error("No se pudieron cargar las estadísticas por municipio");
        }

        const geoJson = (await geoJsonResponse.json()) as GeoJsonObject;
        const statsPayload = (await statsResponse.json()) as MunicipioStatsApiResponse;

        if (!statsPayload.success || !Array.isArray(statsPayload.data)) {
          throw new Error(
            statsPayload.message ||
              "La API de estadísticas respondió en un formato inesperado",
          );
        }

        if (!cancelled) {
          setGeoJsonData(geoJson);
          setStats(statsPayload.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Error desconocido al cargar el mapa",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  const aggregatedStats = useMemo(() => {
    const map = new Map<string, AggregatedMunicipioStat>();

    for (const item of stats) {
      const municipioKey = normalizeText(item.municipio);
      const previous = map.get(municipioKey);

      if (previous) {
        previous.total_clientes_instalados += Number(item.total_clientes_instalados || 0);
        previous.potencia_inversores_kw += Number(item.potencia_inversores_kw || 0);
        previous.potencia_paneles_kw += Number(item.potencia_paneles_kw || 0);
        previous.total_kw_instalados += Number(item.total_kw_instalados || 0);
        if (!previous.provincias.includes(item.provincia)) {
          previous.provincias.push(item.provincia);
        }
      } else {
        map.set(municipioKey, {
          municipio: item.municipio,
          provincias: [item.provincia],
          total_clientes_instalados: Number(item.total_clientes_instalados || 0),
          potencia_inversores_kw: Number(item.potencia_inversores_kw || 0),
          potencia_paneles_kw: Number(item.potencia_paneles_kw || 0),
          total_kw_instalados: Number(item.total_kw_instalados || 0),
        });
      }
    }

    return map;
  }, [stats]);

  const maxMetricValue = useMemo(() => {
    const field = METRIC_CONFIG[selectedMetric].field;
    const values = Array.from(aggregatedStats.values()).map((item) =>
      Number(item[field] || 0),
    );
    const max = Math.max(...values, 0);
    return max > 0 ? max : 1;
  }, [aggregatedStats, selectedMetric]);

  const getMetricValue = (
    stat: AggregatedMunicipioStat,
    metric: MetricKey,
  ): number => {
    const field = METRIC_CONFIG[metric].field;
    return Number(stat[field] || 0);
  };

  const getFeatureStyle = (feature?: Feature): PathOptions => {
    const shapeName = String(
      (feature?.properties as Record<string, unknown> | undefined)?.shapeName ?? "",
    );
    const stat = aggregatedStats.get(normalizeText(shapeName));

    if (!stat) {
      return {
        color: "#93c5fd",
        weight: 0.8,
        fillColor: "#dbeafe",
        fillOpacity: 0.35,
      };
    }

    const value = getMetricValue(stat, selectedMetric);
    const ratio = Math.sqrt(Math.max(value, 0) / maxMetricValue);

    return {
      color: "#1d4ed8",
      weight: 1.1,
      fillColor: heatColorFromRatio(ratio),
      fillOpacity: 0.82,
    };
  };

  const getHoverCardPosition = (x: number, y: number) => {
    const shell = mapShellRef.current;
    if (!shell) return { left: x + 18, top: y - 18 };

    const width = shell.clientWidth;
    const heightValue = shell.clientHeight;
    return {
      left: clamp(x + 18, 12, Math.max(12, width - CARD_WIDTH - 12)),
      top: clamp(y - CARD_HEIGHT - 8, 12, Math.max(12, heightValue - CARD_HEIGHT - 12)),
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const shapeName = String(
      (feature.properties as Record<string, unknown> | undefined)?.shapeName ?? "Municipio",
    );

    const stat = aggregatedStats.get(normalizeText(shapeName)) ?? null;

    if ("on" in layer && "setStyle" in layer) {
      (
        layer as {
          on: (events: Record<string, (event: LeafletMouseEvent) => void>) => void;
          setStyle: (style: PathOptions) => void;
        }
      ).on({
        mouseover: (event: LeafletMouseEvent) => {
          event.target.setStyle({
            weight: 2.2,
            color: "#0ea5e9",
            fillOpacity: 1,
          });

          setHoverInfo({
            municipio: shapeName,
            x: event.containerPoint.x,
            y: event.containerPoint.y,
            stat,
          });
        },
        mousemove: (event: LeafletMouseEvent) => {
          setHoverInfo({
            municipio: shapeName,
            x: event.containerPoint.x,
            y: event.containerPoint.y,
            stat,
          });
        },
        mouseout: (event: LeafletMouseEvent) => {
          event.target.setStyle(getFeatureStyle(feature));
          setHoverInfo((previous) =>
            previous?.municipio === shapeName ? null : previous,
          );
        },
      });
    }
  };

  const hoverCardStyle = hoverInfo
    ? getHoverCardPosition(hoverInfo.x, hoverInfo.y)
    : null;

  return (
    <div className="relative">
      <div className="intel-tilt-stage">
        <div
          ref={mapShellRef}
          className="intel-map-shell relative overflow-hidden rounded-[28px] border border-blue-200 bg-white p-2 shadow-[0_24px_70px_rgba(14,116,144,0.2)]"
        >
          <div className="pointer-events-none absolute inset-0 z-[5] rounded-[24px] [background:radial-gradient(circle_at_18%_15%,rgba(59,130,246,0.18),transparent_42%),radial-gradient(circle_at_85%_80%,rgba(34,211,238,0.16),transparent_38%)]" />
          <div className="pointer-events-none absolute inset-0 z-[6] rounded-[24px] [background:repeating-linear-gradient(180deg,rgba(14,165,233,0.06)_0px,rgba(14,165,233,0.06)_1px,transparent_1px,transparent_8px)]" />
          <div className="intel-radar-sweep pointer-events-none absolute inset-0 z-[7] rounded-[24px]" />

          <div className="absolute left-5 top-5 z-20 grid grid-cols-3 gap-1.5 rounded-xl border border-blue-200 bg-white/90 p-1 shadow-md backdrop-blur">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((metric) => {
              const Icon = METRIC_CONFIG[metric].icon;
              const active = metric === selectedMetric;
              return (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setSelectedMetric(metric)}
                  className={`flex items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors sm:text-xs ${
                    active
                      ? "bg-primary text-white"
                      : "text-primary/80 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {METRIC_CONFIG[metric].label}
                </button>
              );
            })}
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-primary">
              Cargando mapa de calor...
            </div>
          )}

          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-4 text-center text-red-600">
              {error}
            </div>
          )}

          {hoverInfo && hoverCardStyle && (
            <div
              className="pointer-events-none absolute z-30 w-[240px] rounded-2xl border border-cyan-200 bg-slate-950/95 p-3 text-cyan-50 shadow-[0_0_26px_rgba(34,211,238,0.28)] backdrop-blur-md"
              style={{ left: hoverCardStyle.left, top: hoverCardStyle.top }}
            >
              <p className="mb-1 text-sm font-bold text-cyan-100">
                {hoverInfo.municipio}
              </p>
              <p className="mb-2 text-[11px] uppercase tracking-[0.13em] text-cyan-300/80">
                Panel Energético
              </p>
              {hoverInfo.stat ? (
                <div className="space-y-1 text-xs">
                  <p className="text-cyan-100/90">
                    Provincia(s): {hoverInfo.stat.provincias.join(", ")}
                  </p>
                  <p>Clientes: {formatMetric(hoverInfo.stat.total_clientes_instalados)}</p>
                  <p>Paneles: {formatMetric(hoverInfo.stat.potencia_paneles_kw)} kW</p>
                  <p>Inversores: {formatMetric(hoverInfo.stat.potencia_inversores_kw)} kW</p>
                  <p className="mt-2 border-t border-cyan-200/25 pt-2 font-semibold text-cyan-200">
                    Total: {formatMetric(hoverInfo.stat.total_kw_instalados)} kW
                  </p>
                </div>
              ) : (
                <p className="text-xs text-cyan-100/85">
                  Sin instalaciones registradas.
                </p>
              )}
            </div>
          )}

          {geoJsonData && (
            <MapContainer
              center={mapCenter}
              zoom={7}
              minZoom={6}
              maxZoom={10}
              style={{ height, width: "100%" }}
              className="rounded-[20px]"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON
                key={selectedMetric}
                data={geoJsonData}
                style={(feature) => getFeatureStyle(feature as Feature)}
                onEachFeature={(feature, layer) =>
                  onEachFeature(feature as Feature, layer)
                }
              />
            </MapContainer>
          )}
        </div>
      </div>

      <style jsx global>{`
        .intel-tilt-stage {
          perspective: 1500px;
        }

        .intel-map-shell {
          transform: rotateX(7deg) rotateY(-4deg) rotateZ(0.3deg);
          transform-style: preserve-3d;
          transition: transform 450ms ease, box-shadow 450ms ease;
        }

        .intel-map-shell:hover {
          transform: rotateX(4.8deg) rotateY(-2deg) rotateZ(0deg);
          box-shadow: 0 28px 85px rgba(14, 116, 144, 0.26);
        }

        .intel-radar-sweep {
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            transparent 300deg,
            rgba(14, 165, 233, 0.22) 360deg
          );
          mix-blend-mode: screen;
          animation: intel-radar-rotate 7s linear infinite;
          transform-origin: center;
        }

        .intel-map-shell .leaflet-container {
          background: #eff6ff;
        }

        .intel-map-shell .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.8);
          color: #1e3a8a;
          border-top-left-radius: 6px;
          border: 1px solid rgba(147, 197, 253, 0.7);
        }

        .intel-map-shell .leaflet-control-attribution a {
          color: #1d4ed8;
        }

        .intel-map-shell .leaflet-control-zoom a {
          background: rgba(255, 255, 255, 0.9);
          color: #1d4ed8;
          border-color: rgba(147, 197, 253, 0.9);
        }

        .intel-map-shell .leaflet-control-zoom a:hover {
          background: rgba(219, 234, 254, 0.95);
        }

        @keyframes intel-radar-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1024px) {
          .intel-map-shell,
          .intel-map-shell:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}
