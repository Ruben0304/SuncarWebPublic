<svelte:options namespace="svg" />

<script lang="ts">
  // Botón de una zona sobre la casa: un halo que respira, el icono y el nombre.
  import s from "./casa-solar.module.css";
  import { ZONAS_POR_ID, type ZonaId } from "@/components/tienda/zonas";
  import { ICONOS } from "./iconos";
  import NombreBajo from "./NombreBajo.svelte";

  interface Props {
    zona: ZonaId;
    x: number;
    y: number;
    /** Orden entre los botones: escalona su aparición. */
    indice: number;
    /** Escala de todo el dibujo (1 / px por unidad: se dibuja en px de pantalla). */
    k: number;
    /** Si cabe el nombre completo (si no, el corto). */
    completo: boolean;
    /** Diseño vertical: nombres completos y en dos líneas. */
    vertical: boolean;
    onelegir: (zona: ZonaId) => void;
    onresaltar: (zona: ZonaId | null) => void;
  }
  let { zona, x, y, indice, k, completo, vertical, onelegir, onresaltar }: Props = $props();

  const datos = $derived(ZONAS_POR_ID[zona]);
  const Icono = $derived(ICONOS[zona]);

  /** Teclado: Enter o espacio activan los elementos con role="button". */
  const alPulsar = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onelegir(zona);
    }
  };
</script>

<g transform={`translate(${x} ${y}) scale(${k})`}>
  <g
    role="button"
    tabindex="0"
    aria-label={`Ver ${datos.nombre}`}
    class={`${s.pin} ${s.aparecer}`}
    style={`animation-delay: calc(var(--demora, 0s) + ${300 + indice * 70}ms)`}
    onclick={() => onelegir(zona)}
    onkeydown={alPulsar}
    onmouseenter={() => onresaltar(zona)}
    onmouseleave={() => onresaltar(null)}
    onfocus={() => onresaltar(zona)}
    onblur={() => onresaltar(null)}
  >
    <!-- Zona tocable generosa, invisible -->
    <circle r="28" fill="transparent" />
    <circle class={s.halo} r="18" fill="#AFEB17" />
    <g class={s.boton}>
      <circle class={s.anillo} r="18" fill="#012928" stroke="#fff" stroke-width="2.5" />
      <Icono x={-9} y={-9} size={18} color="#fff" strokeWidth={2.2} />
    </g>
    <NombreBajo nombre={completo || vertical ? datos.nombre : datos.corto} y={23} partir={vertical} />
  </g>
</g>
