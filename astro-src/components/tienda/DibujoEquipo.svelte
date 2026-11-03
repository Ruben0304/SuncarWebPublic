<svelte:options namespace="svg" />

<script lang="ts">
  // Dibujo de cada equipo de la casa en coordenadas locales; CasaSolar lo
  // coloca. Los degradados y filtros (url(#…)) los define CasaSolar con el
  // mismo prefijo.
  import type { Equipo } from "@/components/tienda/disenos";
  import s from "./casa-solar.module.css";

  interface Props {
    equipo: Equipo;
    prefijo: string;
  }
  let { equipo, prefijo }: Props = $props();

  const url = (n: string) => `url(#${prefijo}-${n})`;
</script>

{#if equipo === "ventana"}
  <rect x="-36" y="-42" width="72" height="84" rx="3" fill="#D9D3C8" />
  <rect x="-30" y="-36" width="60" height="72" fill={url("vista")} />
  <path d="M0 -36V36M-30 0H30" stroke="#F7F4EE" stroke-width="3" />
  <rect x="-30" y="-36" width="60" height="72" fill={url("vidrio")} />
  <rect x="-30" y="-36" width="60" height="5" fill="#000" opacity=".08" />
  <rect x="-42" y="41" width="84" height="6" rx="1.5" fill="#E9E4DB" />
  <rect x="-42" y="47" width="84" height="3" fill="#000" opacity=".08" />
{:else if equipo === "estante"}
  <ellipse cy="1" rx="40" ry="3.5" fill={url("contacto")} />
  <rect x="-35" y="-76" width="70" height="76" fill="#2B2218" opacity=".14" filter={url("difuso")} />
  <g fill="#9C7A55">
    <rect x="-33" y="-80" width="4" height="80" />
    <rect x="29" y="-80" width="4" height="80" />
    <rect x="-33" y="-56" width="66" height="4" />
    <rect x="-33" y="-28" width="66" height="4" />
    <rect x="-33" y="-4" width="66" height="4" />
  </g>
  <rect x="-25" y="-74" width="26" height="18" rx="1" fill="#C9A16C" />
  <path d="M-12 -74v18" stroke="#E8D3A8" stroke-width="3" />
  <circle cx="17" cy="-65" r="9" fill="#2A2E33" />
  <circle cx="17" cy="-65" r="6" fill="#C0392B" />
  <circle cx="17" cy="-65" r="2.5" fill="#2A2E33" />
  <rect x="-25" y="-44" width="30" height="16" rx="2" fill="#012928" />
  <path d="M-17 -44v-4h14v4" stroke="#012928" stroke-width="2.5" fill="none" />
  <rect x="-25" y="-38" width="30" height="2" fill="#AFEB17" />
  <rect x="9" y="-40" width="18" height="12" rx="1" fill="#E7E1D6" stroke="#CFC7B9" stroke-width=".8" />
  <rect x="-25" y="-20" width="22" height="16" rx="1" fill="#B88F5B" />
  <rect x="-1" y="-16" width="28" height="12" rx="2" fill="#BDB6A8" />
  <path d="M-1 -10h28" stroke="#A39B8C" stroke-width="1" />
{:else if equipo === "ventilador"}
  <ellipse cy="1" rx="24" ry="3.5" fill={url("contacto")} />
  <ellipse cy="-3" rx="16" ry="4" fill="#6F777F" />
  <ellipse cy="-4" rx="16" ry="3" fill="#959CA3" />
  <rect x="-2" y="-62" width="4" height="58" fill={url("aluminio")} />
  <circle cy="-70" r="21" fill="#E8EDF1" fill-opacity=".35" />
  <g class={s.aspas} fill="#9FB3C4" fill-opacity=".85">
    <!-- Caja simétrica alrededor del cubo: así el giro se centra en él -->
    <circle cy="-70" r="22" fill="none" />
    <ellipse cy="-81" rx="5.5" ry="10" />
    <ellipse cy="-81" rx="5.5" ry="10" transform="rotate(120 0 -70)" />
    <ellipse cy="-81" rx="5.5" ry="10" transform="rotate(240 0 -70)" />
  </g>
  <circle cy="-70" r="21" fill="none" stroke="#8D959D" stroke-width="2" />
  <path
    d="M0 -91V-49M-21 -70H21M-15 -85L15 -55M15 -85L-15 -55"
    stroke="#8D959D"
    stroke-opacity=".45"
    stroke-width=".8"
  />
  <circle cy="-70" r="4.5" fill="#6F777F" />
{:else if equipo === "nevera"}
  <rect x="-32" y="-122" width="58" height="124" rx="6" fill="#2B2218" opacity=".18" filter={url("difuso")} />
  <ellipse cy="3" rx="38" ry="4" fill={url("contacto")} />
  <polygon points="-26,-126 28,-126 24,-131 -22,-131" fill={url("tapa")} />
  <rect x="-28" y="-126" width="56" height="126" rx="5" fill={url("equipo")} stroke="#B7BFC6" stroke-width=".8" />
  <path d="M-27 -84H27" stroke="#B7BFC6" stroke-width="1.2" />
  <rect x="-20" y="-122" width="5" height="118" rx="2.5" fill="#fff" opacity=".7" />
  <rect x="18" y="-116" width="3" height="22" rx="1.5" fill="#8C959E" />
  <rect x="18" y="-74" width="3" height="34" rx="1.5" fill="#8C959E" />
{:else if equipo === "breaker"}
  <rect x="-21" y="-21" width="40" height="49" rx="3" fill="#2B2218" opacity=".18" filter={url("difuso")} />
  <rect x="-18" y="-24" width="36" height="48" rx="3" fill={url("equipo")} stroke="#A3ACB4" stroke-width=".8" />
  <rect x="-13" y="-14" width="26" height="22" rx="1.5" fill="#F4F6F7" stroke="#C9D0D6" stroke-width=".8" />
  <path d="M-7 -9v12M0 -9v12M7 -9v12" stroke="#012928" stroke-width="3" stroke-linecap="round" />
  <rect x="-13" y="-14" width="26" height="22" rx="1.5" fill={url("vidrio")} />
{:else if equipo === "baterias"}
  <ellipse cy="3" rx="62" ry="5" fill={url("contacto")} />
  {#each [-48, 4] as x (x)}
    <g>
      <rect x={x - 3} y="-72" width="48" height="74" rx="4" fill="#2B2218" opacity=".16" filter={url("difuso")} />
      <polygon points={`${x + 2},-76 ${x + 42},-76 ${x + 39},-81 ${x + 5},-81`} fill="#3A3F45" />
      <rect x={x} y="-76" width="44" height="76" rx="4" fill={url("equipo")} stroke="#B9C1C8" stroke-width=".8" />
      <rect x={x} y="-76" width="44" height="12" rx="4" fill="#2A2E33" />
      <rect x={x + 10} y="-52" width="24" height="12" rx="2" fill="#0B1220" />
      <rect x={x + 13} y="-49" width="18" height="6" rx="1" fill="#AFEB17" class={s.carga} />
      <path d={`M${x + 8} -16h28M${x + 8} -11h28`} stroke="#D2D8DE" stroke-width="1.5" stroke-linecap="round" />
    </g>
  {/each}
{:else if equipo === "inversor"}
  <rect x="-33" y="-36" width="64" height="80" rx="7" fill="#2B2218" opacity=".2" filter={url("difuso")} />
  <rect x="-30" y="-40" width="60" height="80" rx="6" fill={url("equipo")} stroke="#B3BAC1" stroke-width=".8" />
  <rect x="-22" y="-31" width="44" height="28" rx="3" fill="#2A2E33" />
  <rect x="-17" y="-27" width="34" height="15" rx="2" fill="#0B1220" />
  <path d="M-13 -22h12M-13 -17h22" stroke="#AFEB17" stroke-width="1.6" stroke-linecap="round" />
  <circle cx="-13" cy="5" r="2.3" fill="#AFEB17" class={s.led} />
  <circle cx="-5" cy="5" r="2.3" fill="#F2C300" />
  <path d="M-20 20h40M-20 25h40M-20 30h40" stroke="#D2D8DE" stroke-width="1.5" stroke-linecap="round" />
  <rect x="-26" y="-36" width="4" height="72" rx="2" fill="#fff" opacity=".7" />
{/if}
