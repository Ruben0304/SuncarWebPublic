<script lang="ts">
  import { onMount } from "svelte";
  import MapPin from "lucide-svelte/icons/map-pin";
  import { cargarGoogleMaps, fallaAutenticacion } from "~/lib/googleMaps";

  interface Props {
    lat: number;
    lng: number;
    address: string;
    height?: string;
  }
  let { lat, lng, address, height = "300px" }: Props = $props();

  let contenedor: HTMLDivElement | null = $state(null);
  let listo = $state(false);
  let falla = $state(false);

  onMount(() => {
    let cancelado = false;
    let mapa: google.maps.Map | null = null;
    let info: google.maps.InfoWindow | null = null;
    let marcador: google.maps.marker.AdvancedMarkerElement | null = null;

    (async () => {
      await cargarGoogleMaps();
      const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
      await google.maps.importLibrary("marker");
      if (cancelado || !contenedor) return;

      const position = { lat, lng };
      mapa = new Map(contenedor, {
        center: position,
        zoom: 15,
        // DEMO_MAP_ID habilita los marcadores avanzados sin crear un estilo en la consola.
        mapId: "DEMO_MAP_ID",
        gestureHandling: "cooperative",
        disableDoubleClickZoom: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      // Se arma con nodos y textContent, no con HTML: la dirección viene de la API.
      const contenido = document.createElement("div");
      contenido.style.cssText = "text-align:center;padding:4px 8px";
      const titulo = document.createElement("h3");
      titulo.textContent = "Oficina Suncar";
      titulo.style.cssText = "font-weight:600;color:#012928;margin:0 0 6px";
      const direccion = document.createElement("p");
      direccion.textContent = address;
      direccion.style.cssText = "font-size:14px;color:#4b5563;margin:0 0 6px";
      const coordenadas = document.createElement("p");
      coordenadas.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      coordenadas.style.cssText = "font-size:12px;color:#6b7280;margin:0";
      contenido.append(titulo, direccion, coordenadas);

      info = new google.maps.InfoWindow({ content: contenido });
      marcador = new google.maps.marker.AdvancedMarkerElement({ map: mapa, position, title: "Oficina Suncar" });
      marcador.addEventListener("gmp-click", () => info?.open({ map: mapa!, anchor: marcador! }));

      listo = true;
      // gm_authFailure llega poco después de cargar el script.
      setTimeout(() => {
        if (!cancelado && fallaAutenticacion) falla = true;
      }, 1500);
    })().catch((e) => {
      console.error("[Mapa]", e);
      falla = true;
    });

    return () => {
      cancelado = true;
      info?.close();
      if (marcador) marcador.map = null;
      if (mapa) google.maps.event.clearInstanceListeners(mapa);
    };
  });
</script>

<div class="relative" style={`height: ${height}; width: 100%;`}>
  <div bind:this={contenedor} class="rounded-lg border border-gray-200" style={`height: ${height}; width: 100%;`}></div>
  {#if !listo && !falla}
    <div class="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
      <div class="text-center text-gray-500">
        <MapPin class="w-8 h-8 mx-auto mb-2" />
        <p class="text-sm">Cargando mapa...</p>
      </div>
    </div>
  {/if}
  {#if falla}
    <div class="absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center text-sm text-white">
      No pudimos cargar el mapa. Intenta recargar la página.
    </div>
  {/if}
</div>
