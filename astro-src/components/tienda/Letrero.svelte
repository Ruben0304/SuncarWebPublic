<svelte:options namespace="svg" />

<script lang="ts">
  // Letrero «Selecciona qué necesitas»: sale solo y grande en el centro, viaja
  // a su sitio y señala la casa (animaciones en casa-solar.module.css).
  import s from "./casa-solar.module.css";

  interface Props {
    x: number;
    y: number;
    /** Escala del letrero final respecto a su dibujo base (ya en unidades del dibujo). */
    escala: number;
    /** Del sitio del letrero al centro de la pantalla, en unidades del letrero. */
    dx: number;
    dy: number;
    /** Tamaño del letrero en la intro respecto al final. */
    inicial: number;
    conIntro: boolean;
  }
  let { x, y, escala, dx, dy, inicial, conIntro }: Props = $props();

  // El letrero se dibuja a 160 × 64 px.
  const ANCHO_LETRERO = 160;
</script>

<g transform={`translate(${x} ${y}) scale(${escala})`} pointer-events="none">
  <g
    class={conIntro ? s.viajar : undefined}
    style={`--dx:${dx}px;--dy:${dy}px;--s:${inicial}`}
  >
    <g class={conIntro ? s.brotar : s.aparecer}>
      <rect x="-77" y="-29" width={ANCHO_LETRERO} height="64" rx="18" fill="#012928" opacity=".16" />
      <rect x="-80" y="-32" width={ANCHO_LETRERO} height="64" rx="18" fill="#012928" />
      <text y="-4" text-anchor="middle" font-size="17" font-weight={700} fill="#fff">Selecciona</text>
      <text y="17" text-anchor="middle" font-size="14.5" font-weight={600} fill="#AFEB17">qué necesitas</text>
      <g class={conIntro ? s.flecha : undefined}>
        <g
          class={s.senalar}
          stroke="#012928"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          fill="none"
        >
          <path d="M-66 34C-78 54 -90 64 -100 78" />
          <path d="M-110 70L-101 80L-90 74" />
        </g>
      </g>
    </g>
  </g>
</g>
