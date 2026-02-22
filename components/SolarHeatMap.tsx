"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
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

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
}

interface SolarHeatMapProps {
  endpoint?: string;
  height?: string;
  onStatsLoaded?: (municipios: number) => void;
}

const DEFAULT_ENDPOINT =
  "/api/clientes/estadisticas/kw-instalados-por-municipio";
const MAP_CENTER: [number, number] = [21.5218, -77.7812];

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

function HeatLayer({ points }: { points: HeatPoint[] }) {
  const map = useMap();
  const heatLayerRef = useRef<ReturnType<typeof L.heatLayer> | null>(null);

  useEffect(() => {
    if (points.length === 0) return;

    require("leaflet.heat");

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity,
    ]);

    const layer = L.heatLayer(heatData, {
      radius: 30,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      minOpacity: 0.3,
      gradient: {
        0.0: "#00441b",
        0.2: "#238b45",
        0.35: "#41ae76",
        0.5: "#fee08b",
        0.65: "#fdae61",
        0.8: "#f46d43",
        0.9: "#d73027",
        1.0: "#a50026",
      },
    });

    layer.addTo(map);
    heatLayerRef.current = layer;

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [points, map]);

  return null;
}

export default function SolarHeatMap({
  endpoint = DEFAULT_ENDPOINT,
  height = "550px",
  onStatsLoaded,
}: SolarHeatMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [stats, setStats] = useState<MunicipioStatApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data
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

        if (!geoJsonResponse.ok)
          throw new Error("No se pudo cargar el mapa de municipios");
        if (!statsResponse.ok)
          throw new Error("No se pudieron cargar las estadísticas");

        const geoJson = (await geoJsonResponse.json()) as GeoJsonObject;
        const statsPayload =
          (await statsResponse.json()) as MunicipioStatsApiResponse;

        if (!statsPayload.success || !Array.isArray(statsPayload.data)) {
          throw new Error(
            statsPayload.message ||
              "Formato inválido en la respuesta de estadísticas"
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
              : "Error desconocido al cargar el mapa"
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  // Build heat points
  const heatPoints = useMemo<HeatPoint[]>(() => {
    if (
      !geoJsonData ||
      stats.length === 0 ||
      geoJsonData.type !== "FeatureCollection"
    )
      return [];

    const statsMap = new Map<string, number>();
    for (const item of stats) {
      const key = normalizeText(item.municipio);
      const current = statsMap.get(key) ?? 0;
      statsMap.set(key, current + Number(item.total_kw_instalados || 0));
    }

    const maxValue = Math.max(...Array.from(statsMap.values()), 1);
    const features = (geoJsonData as GeoJSON.FeatureCollection).features;
    const points: HeatPoint[] = [];

    for (const feature of features) {
      const shapeName = String(
        (feature.properties as Record<string, unknown>)?.shapeName ?? ""
      );
      const value = statsMap.get(normalizeText(shapeName)) ?? 0;
      if (value <= 0) continue;

      const centroid = getFeatureCentroid(feature);
      if (!centroid) continue;

      const intensity = Math.sqrt(value / maxValue);
      points.push({
        lat: centroid[0],
        lng: centroid[1],
        intensity: Math.max(intensity, 0.1),
      });
    }

    return points;
  }, [geoJsonData, stats]);

  // Notify parent of municipios count
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
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20">
        {isLoading && (
          <div
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm"
            style={{ height }}
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-400 border-t-transparent mb-3" />
            <p className="text-white/80 text-sm font-medium">
              Cargando mapa de instalaciones...
            </p>
          </div>
        )}

        {error && (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4"
            style={{ height }}
          >
            <p className="text-red-400 text-center text-sm">{error}</p>
          </div>
        )}

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
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <HeatLayer points={heatPoints} />
        </MapContainer>

        {/* Bottom gradient for visual depth */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none rounded-b-2xl lg:rounded-b-3xl" />

        {/* Legend overlay */}
        {!isLoading && !error && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <span className="text-white/50 text-[10px]">Menor</span>
              <div className="h-1.5 w-16 sm:w-20 rounded-full bg-gradient-to-r from-[#238b45] via-[#fee08b] to-[#a50026]" />
              <span className="text-white/50 text-[10px]">Mayor</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
