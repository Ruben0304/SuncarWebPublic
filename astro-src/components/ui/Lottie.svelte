<script lang="ts">
  import { onMount } from "svelte";

  interface Props {
    src: string;
    loop?: boolean;
    autoplay?: boolean;
    class?: string;
  }
  let { src, loop = true, autoplay = true, class: className = "" }: Props = $props();

  let canvas: HTMLCanvasElement | null = $state(null);

  // dotlottie-web dibuja directo sobre un <canvas>; se importa al montar para
  // que el WASM no viaje en el HTML ni bloquee el primer pintado.
  onMount(() => {
    let animacion: { destroy: () => void } | undefined;
    let cancelado = false;
    if (canvas) {
      import("@lottiefiles/dotlottie-web").then(({ DotLottie }) => {
        if (cancelado || !canvas) return;
        animacion = new DotLottie({ canvas, src, loop, autoplay });
      });
    }
    return () => {
      cancelado = true;
      animacion?.destroy();
    };
  });
</script>

<div class={className}>
  <canvas bind:this={canvas} style="width: 100%; height: 100%"></canvas>
</div>
