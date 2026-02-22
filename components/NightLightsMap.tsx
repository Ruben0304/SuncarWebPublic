"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoJsonObject, Feature, Polygon, MultiPolygon } from "geojson";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Cliente {
  cliente_numero: string | null;
  kw_total: number;
}

interface MunicipioStatApiItem {
  provincia: string;
  municipio: string;
  total_clientes_instalados: number;
  potencia_inversores_kw: number;
  potencia_paneles_kw: number;
  total_kw_instalados: number;
  promedio_kw_por_cliente: number;
  clientes: Cliente[];
}

interface MunicipioStatsApiResponse {
  success: boolean;
  message?: string;
  data?: MunicipioStatApiItem[];
  promedio_kw_por_cliente?: number;
  total_municipios?: number;
}

interface HeatPoint {
  lat: number;
  lng: number;
  intensity: number;
  provincia: string;
  municipio: string;
  totalKw: number;
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

function TooltipMarkers({ points, visible }: { points: HeatPoint[]; visible: boolean }) {
  if (!visible || points.length === 0) return null;

  // Create invisible icon
  const invisibleIcon = typeof window !== 'undefined' ? L.divIcon({
    className: '',
    html: '<div style="width:30px;height:30px;background:transparent;cursor:pointer"></div>',
    iconSize: [30, 30],
  }) : undefined;

  if (!invisibleIcon) return null;

  return (
    <>
      {points.map((point, idx) => (
        <Marker
          key={idx}
          position={[point.lat, point.lng]}
          icon={invisibleIcon}
        >
          <Popup className="custom-popup">
            <div className="text-xs">
              <p className="font-bold text-amber-500">{point.municipio}</p>
              <p className="text-gray-300 text-[10px]">{point.provincia}</p>
              <p className="text-white font-semibold mt-1">
                {point.totalKw.toFixed(1)} kW
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function CityLightsLayer({ points, visible }: { points: HeatPoint[]; visible: boolean }) {
  const map = useMap();
  const heatLayerRef = useRef<ReturnType<typeof L.heatLayer> | null>(null);

  useEffect(() => {
    if (points.length === 0) return;

    require("leaflet.heat");

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!visible) return;

    const heatData: [number, number, number][] = points.map((p) => [
      p.lat,
      p.lng,
      p.intensity,
    ]);

    // City lights gradient — warm amber/gold/white like satellite night imagery
    const layer = L.heatLayer(heatData, {
      radius: 28,
      blur: 22,
      maxZoom: 10,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.0: "#1a0800",
        0.15: "#4a1800",
        0.3: "#8b4000",
        0.45: "#c46200",
        0.6: "#e8a020",
        0.75: "#ffc940",
        0.85: "#ffe070",
        0.95: "#fff4c0",
        1.0: "#fffef0",
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
  }, [points, visible, map]);

  return null;
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

  const heatPoints = useMemo<HeatPoint[]>(() => {
    if (!geoJsonData || stats.length === 0 || geoJsonData.type !== "FeatureCollection")
      return [];

    // Build map with adjusted kW (using promedio for -1 clients)
    const statsMap = new Map<string, { kw: number; provincia: string; municipio: string }>();

    // Get global average from response (will be set when we parse stats)
    let globalAverage = 0;

    for (const item of stats) {
      const key = normalizeText(item.municipio);
      const municipioAverage = item.promedio_kw_por_cliente || 0;

      // Calculate adjusted total kW for this municipio
      let adjustedTotalKw = 0;
      for (const cliente of item.clientes) {
        if (cliente.kw_total === -1) {
          // Use municipio average, or global if municipio is 0
          adjustedTotalKw += municipioAverage > 0 ? municipioAverage : globalAverage;
        } else if (cliente.kw_total >= 0) {
          adjustedTotalKw += cliente.kw_total;
        }
      }

      const current = statsMap.get(key);
      if (current) {
        current.kw += adjustedTotalKw;
      } else {
        statsMap.set(key, {
          kw: adjustedTotalKw,
          provincia: item.provincia,
          municipio: item.municipio,
        });
      }
    }

    const maxValue = Math.max(...Array.from(statsMap.values()).map(v => v.kw), 1);
    const features = (geoJsonData as GeoJSON.FeatureCollection).features;
    const points: HeatPoint[] = [];

    for (const feature of features) {
      const shapeName = String(
        (feature.properties as Record<string, unknown>)?.shapeName ?? ""
      );
      const data = statsMap.get(normalizeText(shapeName));
      if (!data || data.kw <= 0) continue;

      const centroid = getFeatureCentroid(feature);
      if (!centroid) continue;

      const intensity = Math.sqrt(data.kw / maxValue);
      points.push({
        lat: centroid[0],
        lng: centroid[1],
        intensity: Math.max(intensity, 0.15),
        provincia: data.provincia,
        municipio: data.municipio,
        totalKw: data.kw,
      });
    }

    return points;
  }, [geoJsonData, stats]);

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
    <div className="relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl border border-white/10">
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
        <CityLightsLayer points={heatPoints} visible={lightsOn} />
        <TooltipMarkers points={heatPoints} visible={lightsOn} />
      </MapContainer>
    </div>
  );
}
