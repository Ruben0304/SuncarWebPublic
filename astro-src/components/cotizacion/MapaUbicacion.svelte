<script lang="ts">
  import { onMount } from "svelte";
  import { cargarGoogleMaps, fallaAutenticacion } from "~/lib/googleMaps";

  interface Props {
    onLocationChange: (lat: number, lng: number, address: string) => void;
    initialLat?: number;
    initialLng?: number;
    height?: string;
  }
  let { onLocationChange, initialLat = 23.1136, initialLng = -82.3666, height = "400px" }: Props = $props();

  // Valores de partida: solo cuentan al crear el mapa
  const inicio = { lat: initialLat, lng: initialLng };

  let contenedor: HTMLDivElement | null = $state(null);
  let position = $state<[number, number]>([inicio.lat, inicio.lng]);
  let address = $state("");
  let loading = $state(false);
  let mapaFalla = $state(false);

  // Si el reverse geocoding de un clic viejo llega tarde, no pisa al más nuevo
  let ultimaBusqueda = 0;

  // Formatea y limpia la dirección que devuelve Nominatim
  function formatAddress(addressData: any): string {
    if (!addressData || !addressData.address) {
      return addressData?.display_name || "";
    }

    const addr = addressData.address;
    const addressParts: string[] = [];

    if (addr.house_number && addr.road) {
      addressParts.push(`${addr.road} ${addr.house_number}`);
    } else if (addr.road) {
      addressParts.push(addr.road);
    }

    if (addr.neighbourhood) {
      addressParts.push(addr.neighbourhood);
    } else if (addr.suburb) {
      addressParts.push(addr.suburb);
    } else if (addr.quarter) {
      addressParts.push(addr.quarter);
    }

    const municipality = addr.municipality || addr.city_district || addr.borough;
    if (municipality && !addressParts.some((part) => part.toLowerCase().includes(municipality.toLowerCase()))) {
      addressParts.push(municipality);
    }

    if (
      addr.city &&
      addr.city !== municipality &&
      !addressParts.some((part) => part.toLowerCase().includes(addr.city.toLowerCase()))
    ) {
      // La ciudad solo se agrega si no es "La Habana" o si no hay otras partes
      if (addr.city.toLowerCase() !== "la habana" || addressParts.length === 0) {
        addressParts.push(addr.city);
      }
    }

    if (addressParts.length > 0) {
      return addressParts.join(", ");
    }

    // Sin partes: se limpia display_name quitando los "La Habana" repetidos
    let cleanedAddress: string = addressData.display_name;
    const laHabanaCount = (cleanedAddress.match(/La Habana/gi) || []).length;
    if (laHabanaCount > 1) {
      const parts = cleanedAddress.split(", ");
      const filteredParts = parts.filter((part, index) => {
        const isLaHabana = part.toLowerCase().includes("la habana");
        if (!isLaHabana) return true;
        const remainingParts = parts.slice(index + 1);
        return !remainingParts.some((p) => p.toLowerCase().includes("la habana"));
      });
      cleanedAddress = filteredParts.join(", ");
    }
    return cleanedAddress;
  }

  // Dirección a partir de coordenadas: Google primero, y Nominatim si falla.
  async function reverseGeocode(lat: number, lng: number) {
    const mio = ++ultimaBusqueda;
    loading = true;
    const publicar = (texto: string) => {
      if (mio !== ultimaBusqueda) return;
      address = texto;
      onLocationChange(lat, lng, texto);
    };
    try {
      let texto = "";
      try {
        const { results } = await new google.maps.Geocoder().geocode({
          location: { lat, lng },
          language: "es",
        });
        // Los "plus codes" (87XJ+4F) no le dicen nada al cliente.
        const mejor = results.find((r) => !r.types.includes("plus_code")) ?? results[0];
        texto = mejor?.formatted_address ?? "";
      } catch {
        // Geocoding API no disponible: se usa Nominatim.
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        );
        const data = await response.json();
        if (data && (data.display_name || data.address)) texto = formatAddress(data);
      }
      publicar(texto || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (error) {
      console.error("Error in reverse geocoding:", error);
      publicar(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      if (mio === ultimaBusqueda) loading = false;
    }
  }

  onMount(() => {
    // Dirección inicial: las coordenadas, sin geocodificar
    const direccionInicial = `${inicio.lat.toFixed(6)}, ${inicio.lng.toFixed(6)}`;
    address = direccionInicial;
    onLocationChange(inicio.lat, inicio.lng, direccionInicial);

    let cancelado = false;
    let mapa: google.maps.Map | null = null;
    let marcador: google.maps.marker.AdvancedMarkerElement | null = null;
    let alSoltar: (() => void) | null = null;
    let alHacerClic: google.maps.MapsEventListener | null = null;

    function cambiarPosicion(lat: number, lng: number) {
      position = [lat, lng];
      if (marcador) marcador.position = { lat, lng };
      reverseGeocode(lat, lng);
    }

    (async () => {
      await cargarGoogleMaps();
      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;
      if (cancelado || !contenedor) return;

      mapa = new Map(contenedor, {
        center: { lat: inicio.lat, lng: inicio.lng },
        zoom: 13,
        // DEMO_MAP_ID habilita los marcadores avanzados sin crear un estilo en la consola.
        mapId: "DEMO_MAP_ID",
        gestureHandling: "greedy",
        mapTypeControl: false,
        streetViewControl: false,
      });

      // Marcador arrastrable y clic en el mapa
      const m = new AdvancedMarkerElement({
        map: mapa,
        position: { lat: inicio.lat, lng: inicio.lng },
        gmpDraggable: true,
        title: "Arrastra para elegir la ubicación",
      });
      marcador = m;
      alSoltar = () => {
        const p = m.position as google.maps.LatLngLiteral | google.maps.LatLng | null;
        if (!p) return;
        const lat = typeof p.lat === "function" ? p.lat() : p.lat;
        const lng = typeof p.lng === "function" ? p.lng() : p.lng;
        cambiarPosicion(lat, lng);
      };
      m.addEventListener("gmp-dragend", alSoltar);
      alHacerClic = mapa.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) cambiarPosicion(e.latLng.lat(), e.latLng.lng());
      });

      setTimeout(() => {
        if (!cancelado && fallaAutenticacion) mapaFalla = true;
      }, 1500);
    })().catch((e) => {
      console.error("[MapaUbicacion]", e);
      mapaFalla = true;
    });

    return () => {
      cancelado = true;
      if (marcador) {
        if (alSoltar) marcador.removeEventListener("gmp-dragend", alSoltar);
        marcador.map = null;
      }
      alHacerClic?.remove();
      if (mapa) google.maps.event.clearInstanceListeners(mapa);
    };
  });
</script>

<div class="space-y-4">
  <div class="relative">
    <div class="relative">
      <div bind:this={contenedor} class="rounded-lg border border-gray-300 z-0" style:height style:width="100%"></div>
      {#if mapaFalla}
        <div class="absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center text-sm text-white rounded-lg">
          No pudimos cargar el mapa. Intenta recargar la página.
        </div>
      {/if}
    </div>

    {#if loading}
      <div class="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
        <div class="bg-white px-4 py-2 rounded-lg shadow-lg">
          <span class="text-primary font-medium">Obteniendo dirección...</span>
        </div>
      </div>
    {/if}
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p class="text-sm text-blue-800">
      <strong>Instrucciones:</strong> Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación exacta donde se instalará el sistema solar.
    </p>
  </div>

  {#if address}
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div class="flex items-start gap-2">
        <div class="w-4 h-4 bg-red-500 rounded-full mt-1 flex-shrink-0"></div>
        <div>
          <p class="text-sm font-medium text-gray-700 mb-1">Ubicación seleccionada:</p>
          <p class="text-sm text-gray-600 break-words">{address}</p>
          <p class="text-xs text-gray-500 mt-1">
            Coordenadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
