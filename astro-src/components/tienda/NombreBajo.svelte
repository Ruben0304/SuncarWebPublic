<svelte:options namespace="svg" />

<script lang="ts">
  // Pastilla blanca con el nombre, centrada bajo un botón (en px). Con
  // `partir`, los nombres de varias palabras van en dos líneas.
  interface Props {
    nombre: string;
    y: number;
    partir?: boolean;
  }
  let { nombre, y, partir = false }: Props = $props();

  const lineas = $derived(partir ? nombre.split(" ") : [nombre]);
  const ancho = $derived(16 + Math.max(...lineas.map((l) => l.length)) * 6.6);
  const alto = $derived(6 + lineas.length * 14);
</script>

<g transform={`translate(${-ancho / 2} ${y})`} pointer-events="none">
  <rect width={ancho} height={alto} rx={Math.min(10, alto / 2)} fill="#fff" fill-opacity=".92" />
  {#each lineas as linea, i (i)}
    <text
      x={ancho / 2}
      y={14 + i * 14}
      text-anchor="middle"
      font-size="11.5"
      font-weight={700}
      fill="#012928"
    >
      {linea}
    </text>
  {/each}
</g>
