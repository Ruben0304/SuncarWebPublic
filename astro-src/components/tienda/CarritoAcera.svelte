<svelte:options namespace="svg" />

<script lang="ts">
  // Carrito de compras dibujado en la acera: abre el drawer del carrito.
  import s from "./casa-solar.module.css";
  import NombreBajo from "./NombreBajo.svelte";

  interface Props {
    x: number;
    y: number;
    /** Escala de todo el dibujo (1 / px por unidad: se dibuja en px de pantalla). */
    k: number;
    /** Tamaño del carrito respecto a su dibujo base. */
    escala: number;
    enCarrito: number;
    onabrir: () => void;
  }
  let { x, y, k, escala, enCarrito, onabrir }: Props = $props();

  /** Teclado: Enter o espacio activan los elementos con role="button". */
  const alPulsar = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onabrir();
    }
  };
</script>

<g transform={`translate(${x} ${y}) scale(${k})`}>
  <g
    role="button"
    tabindex="0"
    aria-label={`Abrir carrito${enCarrito ? `, ${enCarrito} productos` : ""}`}
    class={`${s.pin} ${s.aparecer}`}
    onclick={onabrir}
    onkeydown={alPulsar}
  >
    <circle cy="-22" r="30" fill="transparent" />
    <g class={s.boton}>
      <g transform={`scale(${escala})`}>
        <ellipse rx="34" ry="3.5" fill="#2B2218" opacity=".25" />
        <!-- Panel solar asomando del carrito -->
        <polygon points="-18,-52 6,-60 14,-30 -10,-24" fill="#1D2B46" stroke="#CBD2DA" stroke-width="1.5" />
        <path d="M-30 -36H26L19 -14H-23Z" fill="#012928" />
        <path
          d="M-21 -32V-17M-11 -32V-15M-1 -32V-14M9 -32V-14M18 -32V-16"
          stroke="#AFEB17"
          stroke-width="1.2"
          opacity=".55"
        />
        <path
          d="M26 -36L33 -50H42"
          stroke="#012928"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
        <path
          d="M-23 -14L-26 -8H21"
          stroke="#012928"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        />
        <circle cx="-20" cy="-4" r="4" fill="#2A2E33" />
        <circle cx="16" cy="-4" r="4" fill="#2A2E33" />
      </g>
      {#if enCarrito > 0}
        <g transform={`translate(${22.5 * escala} ${-50 * escala})`}>
          <circle r="10" fill="#AFEB17" stroke="#012928" stroke-width="1.5" />
          <text text-anchor="middle" y="4" font-size="11" font-weight={800} fill="#012928">
            {enCarrito}
          </text>
        </g>
      {/if}
    </g>
    <NombreBajo nombre="Carrito" y={10} />
  </g>
</g>
