"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
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
}

const DEFAULT_ENDPOINT = "/api/clientes/estadisticas/kw-instalados-por-municipio";
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
    // Use the largest polygon
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

/**
 * Inner component that manages the L.heatLayer on the Leaflet map.
 * Uses progressive animation to reveal heat points.
 */
function HeatLayer({
  points,
  animate,
}: {
  points: HeatPoint[];
  animate: boolean;
}) {
  const map = useMap();
  const heatLayerRef = useRef<ReturnType<typeof L.heatLayer> | null>(null);
  const animationRef = useRef<number | null>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (points.length === 0) return;

    // Import leaflet.heat side-effect (attaches L.heatLayer)
    require("leaflet.heat");

    // Remove existing layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity,
    ]);

    const layer = L.heatLayer([], {
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

    if (animate && !hasAnimated.current) {
      hasAnimated.current = true;
      // Animate: add points in progressive batches
      const batchSize = Math.max(1, Math.ceil(heatData.length / 20));
      let currentIndex = 0;

      function addBatch() {
        if (!heatLayerRef.current) return;
        const end = Math.min(currentIndex + batchSize, heatData.length);
        const currentBatch = heatData.slice(0, end);
        heatLayerRef.current.setLatLngs(currentBatch);
        currentIndex = end;
        if (currentIndex < heatData.length) {
          animationRef.current = requestAnimationFrame(() => {
            setTimeout(addBatch, 80);
          });
        }
      }

      // Start animation after a short delay
      const timeout = setTimeout(addBatch, 300);
      return () => {
        clearTimeout(timeout);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    } else {
      // No animation, show all points immediately
      layer.setLatLngs(heatData);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
    };
  }, [points, map, animate]);

  return null;
}

export default function SolarHeatMap({
  endpoint = DEFAULT_ENDPOINT,
  height = "550px",
}: SolarHeatMapProps) {
  const [geoJsonData, setGeoJsonData] = useState<GeoJsonObject | null>(null);
  const [stats, setStats] = useState<MunicipioStatApiItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer - start animation when visible
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

        if (!geoJsonResponse.ok) {
          throw new Error("No se pudo cargar el mapa de municipios");
        }
        if (!statsResponse.ok) {
          throw new Error("No se pudieron cargar las estadísticas");
        }

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

  // Build heat points from GeoJSON + stats
  const heatPoints = useMemo<HeatPoint[]>(() => {
    if (
      !geoJsonData ||
      stats.length === 0 ||
      geoJsonData.type !== "FeatureCollection"
    )
      return [];

    // Build stats lookup by normalized municipio name
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

      // Normalize intensity using sqrt for better distribution
      const intensity = Math.sqrt(value / maxValue);

      points.push({
        lat: centroid[0],
        lng: centroid[1],
        intensity: Math.max(intensity, 0.1),
      });
    }

    return points;
  }, [geoJsonData, stats]);

  // Total kW for display
  const totalKw = useMemo(() => {
    return stats.reduce(
      (sum, item) => sum + Number(item.total_kw_instalados || 0),
      0
    );
  }, [stats]);

  const totalMunicipios = useMemo(() => {
    const unique = new Set(stats.map((s) => normalizeText(s.municipio)));
    return unique.size;
  }, [stats]);

  return (
    <div ref={sectionRef} className="relative">
      {/* Map container */}
      <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20">
        {/* Loading overlay */}
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

        {/* Error overlay */}
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
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
          />
          {isVisible && <HeatLayer points={heatPoints} animate={true} />}
        </MapContainer>

        {/* Gradient overlay at bottom for stats readability */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/60 via-black/30 to-transparent z-10 pointer-events-none rounded-b-2xl lg:rounded-b-3xl" />

        {/* Stats overlay at bottom */}
        {!isLoading && !error && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex gap-4 sm:gap-8">
                <div>
                  <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider font-medium">
                    kW Instalados
                  </p>
                  <p className="text-white text-xl sm:text-3xl font-bold">
                    {totalKw.toLocaleString("es-CU")}
                    <span className="text-sm sm:text-base font-normal text-white/70 ml-1">
                      kW
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider font-medium">
                    Municipios
                  </p>
                  <p className="text-white text-xl sm:text-3xl font-bold">
                    {totalMunicipios}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-[10px] sm:text-xs">
                  Menor
                </span>
                <div className="h-2 w-20 sm:w-28 rounded-full bg-gradient-to-r from-[#238b45] via-[#fee08b] to-[#a50026]" />
                <span className="text-white/50 text-[10px] sm:text-xs">
                  Mayor
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
