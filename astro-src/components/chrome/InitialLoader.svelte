<script lang="ts">
  import { onMount } from "svelte";

  const MIN_VISIBLE_MS = 900;
  const MAX_VISIBLE_MS = 5000;
  const FADE_MS = 300;

  let phase: "visible" | "fading" | "gone" = $state("visible");
  let canvasEl: HTMLCanvasElement | null = $state(null);

  onMount(() => {
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    let goneTimer: ReturnType<typeof setTimeout> | undefined;
    let done = false;

    const hide = () => {
      phase = "fading";
      goneTimer = setTimeout(() => (phase = "gone"), FADE_MS);
    };
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(capTimer);
      fadeTimer = setTimeout(hide, Math.max(0, MIN_VISIBLE_MS - performance.now()));
    };
    const capTimer = setTimeout(finish, Math.max(0, MAX_VISIBLE_MS - performance.now()));

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    // dotlottie-web: versión sin framework del mismo paquete que usa el
    // resto del sitio (dotlottie-react), dibuja directo sobre un <canvas>.
    let dotLottie: { destroy: () => void } | undefined;
    if (canvasEl) {
      import("@lottiefiles/dotlottie-web").then(({ DotLottie }) => {
        if (!canvasEl) return;
        dotLottie = new DotLottie({ canvas: canvasEl, src: "/suncar-loader.lottie", loop: true, autoplay: true });
      });
    }

    return () => {
      window.removeEventListener("load", finish);
      clearTimeout(capTimer);
      clearTimeout(fadeTimer);
      clearTimeout(goneTimer);
      dotLottie?.destroy();
    };
  });
</script>

<noscript>
  <style>
    .initial-loader {
      display: none !important;
    }
  </style>
</noscript>

{#if phase !== "gone"}
  <div
    class={`initial-loader fixed inset-0 z-[9999] flex items-center justify-center bg-[#F2F2EF] transition-opacity ease-out ${
      phase === "fading" ? "pointer-events-none opacity-0" : "opacity-100"
    }`}
    style={`transition-duration: ${FADE_MS}ms`}
    role="status"
    aria-live="polite"
    aria-label="Cargando SunCar"
  >
    <div class="h-44 w-44 sm:h-52 sm:w-52">
      <canvas bind:this={canvasEl} class="h-full w-full"></canvas>
    </div>
  </div>
{/if}
