"use client";

import { useEffect, useMemo, useState } from "react";
import type { Feature, GeoJsonObject } from "geojson";
import type { Layer, LeafletMouseEvent, PathOptions } from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import { Activity, Cpu, Sun, Zap } from "lucide-react";
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

interface FuturisticMunicipioHeatMapProps {
  endpoint?: string;
  height?: string;
}

const DEFAULT_ENDPOINT = "/api/clientes/estadisticas/kw-instalados-por-municipio";

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    field:
      | "potencia_paneles_kw"
      | "potencia_inversores_kw"
      | "total_kw_instalados";
    icon: typeof Sun;
  }
> = {
  paneles: {
    label: "Paneles",
    unit: "kW",
    field: "potencia_paneles_kw",
    icon: Sun,
  },
  inversores: {
    label: "Inversores",
    unit: "kW",
    field: "potencia_inversores_kw",
    icon: Cpu,
  },
  total: {
    label: "Total",
    unit: "kW",
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
  if (ratio <= 0) return "#081224";
  if (ratio < 0.15) return "#0c2b44";
  if (ratio < 0.3) return "#13526b";
  if (ratio < 0.5) return "#1b7e9f";
  if (ratio < 0.7) return "#25a5c9";
  if (ratio < 0.85) return "#5fc0d4";
  if (ratio < 0.95) return "#f4c84b";
  return "#ff6b6b";
}

export default function FuturisticMunicipioHeatMap({
  endpoint = DEFAULT_ENDPOINT,
  height = "620px",
}: FuturisticMunicipioHeatMapProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("paneles");
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

  const totalClientes = useMemo(
    () => stats.reduce((sum, item) => sum + Number(item.total_clientes_instalados || 0), 0),
    [stats],
  );

  const totalKwGlobal = useMemo(
    () => stats.reduce((sum, item) => sum + Number(item.total_kw_instalados || 0), 0),
    [stats],
  );

  const maxMetricValue = useMemo(() => {
    const field = METRIC_CONFIG[selectedMetric].field;
    const values = Array.from(aggregatedStats.values()).map((item) =>
      Number(item[field] || 0),
    );
    const max = Math.max(...values, 0);
    return max > 0 ? max : 1;
  }, [aggregatedStats, selectedMetric]);

  const topMunicipios = useMemo(() => {
    const field = METRIC_CONFIG[selectedMetric].field;
    return Array.from(aggregatedStats.values())
      .sort((a, b) => Number(b[field]) - Number(a[field]))
      .slice(0, 5);
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
        color: "#1f2b45",
        weight: 0.8,
        fillColor: "#081224",
        fillOpacity: 0.5,
      };
    }

    const value = getMetricValue(stat, selectedMetric);
    const ratio = Math.sqrt(Math.max(value, 0) / maxMetricValue);

    return {
      color: "#31b4d4",
      weight: 1.2,
      fillColor: heatColorFromRatio(ratio),
      fillOpacity: 0.85,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const shapeName = String(
      (feature.properties as Record<string, unknown> | undefined)?.shapeName ?? "Municipio",
    );

    const stat = aggregatedStats.get(normalizeText(shapeName));
    const unit = METRIC_CONFIG[selectedMetric].unit;
    const value = stat ? getMetricValue(stat, selectedMetric) : 0;

    const tooltipHtml = stat
      ? `
        <div class="intel-tooltip">
          <div class="intel-tooltip-title">${shapeName}</div>
          <div class="intel-tooltip-row">Provincia(s): ${stat.provincias.join(", ")}</div>
          <div class="intel-tooltip-row">Clientes: ${stat.total_clientes_instalados}</div>
          <div class="intel-tooltip-row">Paneles: ${formatMetric(stat.potencia_paneles_kw)} kW</div>
          <div class="intel-tooltip-row">Inversores: ${formatMetric(stat.potencia_inversores_kw)} kW</div>
          <div class="intel-tooltip-highlight">${METRIC_CONFIG[selectedMetric].label}: ${formatMetric(value)} ${unit}</div>
        </div>
      `
      : `
        <div class="intel-tooltip">
          <div class="intel-tooltip-title">${shapeName}</div>
          <div class="intel-tooltip-row">Sin instalaciones registradas</div>
        </div>
      `;

    if ("bindTooltip" in layer) {
      (layer as {
        bindTooltip: (content: string, options: Record<string, unknown>) => void;
      }).bindTooltip(tooltipHtml, {
        sticky: true,
        opacity: 1,
        direction: "top",
        className: "intel-tooltip-shell",
      });
    }

    if ("on" in layer && "setStyle" in layer) {
      (
        layer as {
          on: (events: Record<string, (event: LeafletMouseEvent) => void>) => void;
          setStyle: (style: PathOptions) => void;
        }
      ).on({
        mouseover: (event: LeafletMouseEvent) => {
          event.target.setStyle({
            weight: 2.5,
            color: "#a5f3fc",
            fillOpacity: 1,
          });
        },
        mouseout: (event: LeafletMouseEvent) => {
          event.target.setStyle(getFeatureStyle(feature));
        },
      });
    }
  };

  const selectedMetricLabel = METRIC_CONFIG[selectedMetric].label;
  const selectedMetricIcon = METRIC_CONFIG[selectedMetric].icon;
  const SelectedMetricIcon = selectedMetricIcon;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-slate-950 via-[#02172d] to-slate-900 p-4 sm:p-6 lg:p-8 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.35),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.25),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(14,116,144,0.22),transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-20 [background:repeating-linear-gradient(180deg,rgba(56,189,248,0.12)_0px,rgba(56,189,248,0.12)_1px,transparent_1px,transparent_7px)]" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Activity className="h-3.5 w-3.5" />
              Centro de Inteligencia Energética
            </p>
            <h3 className="text-2xl font-bold text-cyan-100 sm:text-3xl">
              Radar Nacional de Instalaciones
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-cyan-100/80 sm:text-base">
              Mapa táctico por municipio con visualización de calor para potencia
              instalada.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-cyan-400/30 bg-slate-950/60 p-2">
            {(Object.keys(METRIC_CONFIG) as MetricKey[]).map((metric) => {
              const Icon = METRIC_CONFIG[metric].icon;
              const active = metric === selectedMetric;

              return (
                <button
                  key={metric}
                  type="button"
                  onClick={() => setSelectedMetric(metric)}
                  className={`flex min-w-[96px] items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all sm:text-sm ${
                    active
                      ? "bg-cyan-400/20 text-cyan-100 shadow-[0_0_22px_rgba(56,189,248,0.4)]"
                      : "text-cyan-200/70 hover:bg-cyan-400/10 hover:text-cyan-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {METRIC_CONFIG[metric].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-cyan-300/70">
              Municipios Activos
            </p>
            <p className="mt-2 text-2xl font-bold text-cyan-100">
              {aggregatedStats.size}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-cyan-300/70">
              Clientes Instalados
            </p>
            <p className="mt-2 text-2xl font-bold text-cyan-100">
              {formatMetric(totalClientes)}
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-cyan-300/70">
              Potencia Total
            </p>
            <p className="mt-2 text-2xl font-bold text-cyan-100">
              {formatMetric(totalKwGlobal)} kW
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="intel-map-shell relative overflow-hidden rounded-2xl border border-cyan-400/40 bg-slate-950/60 p-2">
            {isLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 text-cyan-100">
                Cargando mapa táctico...
              </div>
            )}

            {error && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/90 px-4 text-center text-red-300">
                {error}
              </div>
            )}

            {geoJsonData && (
              <MapContainer
                center={mapCenter}
                zoom={7}
                minZoom={6}
                maxZoom={10}
                style={{ height, width: "100%" }}
                className="rounded-xl"
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

          <aside className="space-y-4 rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-cyan-100">
              <SelectedMetricIcon className="h-4 w-4" />
              <h4 className="text-sm font-semibold uppercase tracking-[0.14em]">
                Top Municipios ({selectedMetricLabel})
              </h4>
            </div>

            <div className="space-y-2">
              {topMunicipios.map((municipio, idx) => (
                <div
                  key={`${municipio.municipio}-${idx}`}
                  className="rounded-xl border border-cyan-400/20 bg-slate-900/70 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-cyan-100">
                    {idx + 1}. {municipio.municipio}
                  </p>
                  <p className="text-xs text-cyan-200/80">
                    {formatMetric(getMetricValue(municipio, selectedMetric))}{" "}
                    {METRIC_CONFIG[selectedMetric].unit}
                  </p>
                  <p className="text-[11px] text-cyan-300/60">
                    {municipio.provincias.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .intel-map-shell .leaflet-container {
          background: #020617;
        }

        .intel-map-shell .leaflet-control-attribution {
          background: rgba(2, 6, 23, 0.8);
          color: rgba(186, 230, 253, 0.85);
          border-top-left-radius: 6px;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }

        .intel-map-shell .leaflet-control-attribution a {
          color: rgba(125, 211, 252, 0.95);
        }

        .intel-map-shell .leaflet-control-zoom a {
          background: rgba(2, 6, 23, 0.85);
          color: #a5f3fc;
          border-color: rgba(56, 189, 248, 0.4);
        }

        .intel-map-shell .leaflet-control-zoom a:hover {
          background: rgba(14, 116, 144, 0.5);
        }

        .leaflet-tooltip.intel-tooltip-shell {
          border: 1px solid rgba(34, 211, 238, 0.35);
          background: rgba(2, 6, 23, 0.94);
          color: #cffafe;
          box-shadow: 0 0 28px rgba(34, 211, 238, 0.22);
          border-radius: 10px;
          padding: 0;
        }

        .leaflet-tooltip.intel-tooltip-shell::before {
          border-top-color: rgba(34, 211, 238, 0.35);
        }

        .intel-tooltip {
          padding: 10px 12px;
          font-size: 12px;
          line-height: 1.4;
          min-width: 190px;
        }

        .intel-tooltip-title {
          font-size: 13px;
          font-weight: 700;
          color: #a5f3fc;
          margin-bottom: 6px;
        }

        .intel-tooltip-row {
          color: rgba(186, 230, 253, 0.9);
        }

        .intel-tooltip-highlight {
          margin-top: 6px;
          color: #22d3ee;
          font-weight: 700;
        }
      `}</style>
    </section>
  );
}
