<script lang="ts">
  // Una escena: la casa a pantalla completa en un diseño (vertical u horizontal)
  // con sus botones, el letrero de la intro y el carrito de la acera.
  import { onMount } from "svelte";
  import { carrito, abrirCarrito } from "~/lib/cart.svelte";
  import { DISENO_MOVIL, type Diseno } from "@/components/tienda/disenos";
  import type { ZonaId } from "@/components/tienda/zonas";
  import s from "./casa-solar.module.css";
  import CasaSolar from "./CasaSolar.svelte";
  import Letrero from "./Letrero.svelte";
  import CarritoAcera from "./CarritoAcera.svelte";
  import PinZona from "./PinZona.svelte";

  // Por debajo (px por unidad del dibujo) los nombres completos no caben y el
  // botón usa el corto.
  const ESCALA_NOMBRE_COMPLETO = 0.7;
  // Con la casa más pequeña que esto el letrero tapa demasiado dibujo.
  const ESCALA_CON_LETRERO = 0.4;
  // El letrero se dibuja a 160 × 64 px.
  const ANCHO_LETRERO = 160;
  // En el diseño vertical el letrero se encoge con la casa hasta este mínimo
  // en pantallas pequeñas.
  const ESCALA_REFERENCIA_VERTICAL = 0.7;
  const AJUSTE_MINIMO_VERTICAL = 0.75;
  // En la intro el letrero ocupa este ancho (px), sin pasar del 80 % de la pantalla.
  const ANCHO_LETRERO_INTRO = 520;
  // Cuándo entra la casa: tras el viaje del letrero y su flecha (ver el CSS).
  const DEMORA_CASA = "3.2s";

  interface Props {
    diseno: Diseno;
    prefijo: string;
    class: string;
    onelegir: (zona: ZonaId) => void;
  }
  let { diseno, prefijo, class: className, onelegir }: Props = $props();

  interface Medida {
    /** Píxeles por unidad del dibujo. */
    k: number;
    /** Del sitio del letrero al centro de la pantalla, en unidades del letrero. */
    dx: number;
    dy: number;
    /** Tamaño del letrero en la intro respecto al final. */
    s: number;
    /** Tamaño final del letrero (px por unidad base). */
    letrero: number;
    /** Si la casa se ve lo bastante grande para dibujar el letrero. */
    conLetrero: boolean;
  }

  let el: HTMLDivElement | undefined = $state();
  // null mientras no se ha medido o si esta escena está oculta.
  let medida = $state<Medida | null>(null);
  // Se decide en la primera medida y no cambia: si la casa ya entró, un giro
  // de pantalla no debe volver a ocultarla.
  let conIntro = $state<boolean | null>(null);
  let resaltada = $state<ZonaId | null>(null);

  // En el diseño vertical (móvil de pie) los nombres van siempre completos,
  // en dos líneas si hace falta.
  const vertical = $derived(diseno === DISENO_MOVIL);
  const k = $derived(medida?.k ?? null);
  const completo = $derived(k !== null && k >= ESCALA_NOMBRE_COMPLETO);
  /** Px de pantalla → unidades del dibujo. */
  const u = (px: number) => px / (k ?? 1);

  onMount(() => {
    if (!el) return;
    const caja_el = el;
    const medir = () => {
      const caja = caja_el.getBoundingClientRect();
      if (caja.width <= 0 || caja.height <= 0) {
        medida = null;
        return;
      }
      const escala = Math.min(caja.width / diseno.caja.w, caja.height / diseno.caja.h);
      // El dibujo va centrado en horizontal y pegado abajo (xMidYMax meet).
      const x =
        caja.left + (caja.width - diseno.caja.w * escala) / 2 + (diseno.letrero.x - diseno.caja.x) * escala;
      const y = caja.bottom - diseno.caja.h * escala + (diseno.letrero.y - diseno.caja.y) * escala;
      const ajuste = vertical
        ? Math.min(1, Math.max(AJUSTE_MINIMO_VERTICAL, escala / ESCALA_REFERENCIA_VERTICAL))
        : 1;
      const letrero = diseno.escalas.letrero * ajuste;
      const conLetrero = escala >= ESCALA_CON_LETRERO;
      const pantalla = (caja_el.parentElement ?? caja_el).getBoundingClientRect();
      const anchoIntro = Math.min(pantalla.width * 0.8, ANCHO_LETRERO_INTRO);
      medida = {
        k: escala,
        dx: (pantalla.left + pantalla.width / 2 - x) / letrero,
        dy: (pantalla.top + pantalla.height / 2 - y) / letrero,
        s: Math.max(1, anchoIntro / (ANCHO_LETRERO * letrero)),
        letrero,
        conLetrero,
      };
      conIntro ??= conLetrero;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(caja_el);
    return () => ro.disconnect();
  });
</script>

<div bind:this={el} class={className} style:--demora={conIntro ? DEMORA_CASA : "0s"}>
  <CasaSolar
    {diseno}
    {prefijo}
    activa={resaltada}
    dibujoClass={k === null ? s.casaOculta : s.casaEntrar}
    preserveAspectRatio="xMidYMax meet"
    class="h-full w-full"
  >
    {#if k !== null && medida}
      <!-- Todo lo de aquí dentro se dibuja en px de pantalla: escala 1/k. -->
      {#if medida.conLetrero}
        <Letrero
          x={diseno.letrero.x}
          y={diseno.letrero.y}
          escala={u(medida.letrero)}
          dx={medida.dx}
          dy={medida.dy}
          inicial={medida.s}
          conIntro={conIntro === true}
        />
      {/if}

      <CarritoAcera
        x={diseno.carrito.x}
        y={diseno.carrito.y}
        k={u(1)}
        escala={diseno.escalas.carrito}
        enCarrito={carrito.totalItems}
        onabrir={abrirCarrito}
      />

      {#each diseno.pines as pin, i (pin.zona)}
        <PinZona
          zona={pin.zona}
          x={pin.x}
          y={pin.y}
          indice={i}
          k={u(1)}
          {completo}
          {vertical}
          {onelegir}
          onresaltar={(z) => (resaltada = z)}
        />
      {/each}
    {/if}
  </CasaSolar>
</div>
