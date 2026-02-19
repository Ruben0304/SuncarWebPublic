"use client";

import { useEffect, useMemo, useState } from "react";
import type { Feature, GeoJsonObject } from "geojson";
import type { PathOptions } from "leaflet";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
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
}

interface FuturisticMunicipioHeatMapProps {
  endpoint?: string;
  height?: string;
}

const DEFAULT_ENDPOINT = "/api/clientes/estadisticas/kw-instalados-por-municipio";
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

function heatColorFromRatio(ratio: number): string {
  if (ratio <= 0) return "#e5e7eb";
  if (ratio < 0.2) return "#c7d2fe";
  if (ratio < 0.4) return "#93c5fd";
  if (ratio < 0.6) return "#60a5fa";
  if (ratio < 0.78) return "#38bdf8";
  if (ratio < 0.9) return "#facc15";
  return "#f97316";
}

export default function FuturisticMunicipioHeatMap({
  endpoint = DEFAULT_ENDPOINT,
  height = "620px",
}: FuturisticMunicipioHeatMapProps) {
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
          throw new Error("No se pudo cargar el mapa de municipios");
        }
        if (!statsResponse.ok) {
          throw new Error("No se pudieron cargar las estadísticas");
        }

        const geoJson = (await geoJsonResponse.json()) as GeoJsonObject;
        const statsPayload = (await statsResponse.json()) as MunicipioStatsApiResponse;

        if (!statsPayload.success || !Array.isArray(statsPayload.data)) {
          throw new Error(
            statsPayload.message || "Formato inválido en la respuesta de estadísticas",
          );
        }

        if (!cancelled) {
          setGeoJsonData(geoJson);
          setStats(statsPayload.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error desconocido al cargar el mapa",
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

  const metricByMunicipio = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of stats) {
      map.set(normalizeText(item.municipio), Number(item.total_kw_instalados || 0));
    }
    return map;
  }, [stats]);

  const maxMetricValue = useMemo(() => {
    const values = Array.from(metricByMunicipio.values());
    const max = Math.max(...values, 0);
    return max > 0 ? max : 1;
  }, [metricByMunicipio]);

  const getFeatureStyle = (feature?: Feature): PathOptions => {
    const shapeName = String(
      (feature?.properties as Record<string, unknown> | undefined)?.shapeName ?? "",
    );
    const value = metricByMunicipio.get(normalizeText(shapeName)) ?? 0;
    const ratio = Math.sqrt(Math.max(value, 0) / maxMetricValue);

    return {
      color: "#ffffff",
      weight: 1,
      fillColor: heatColorFromRatio(ratio),
      fillOpacity: 0.9,
    };
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.12),transparent_40%),radial-gradient(circle_at_80%_85%,rgba(34,211,238,0.10),transparent_40%)]" />

      <div className="relative p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-end">
          <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-600">
            <span className="text-[11px] uppercase tracking-wide">Menor</span>
            <span className="h-2 w-24 rounded-full bg-gradient-to-r from-[#e5e7eb] via-[#60a5fa] to-[#f97316]" />
            <span className="text-[11px] uppercase tracking-wide">Mayor</span>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-blue-100">
          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 text-primary">
              Cargando mapa...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 px-4 text-center text-red-600">
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
              className="rounded-2xl"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <GeoJSON
                data={geoJsonData}
                style={(feature) => getFeatureStyle(feature as Feature)}
              />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}
