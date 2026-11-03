<script lang="ts">
  import { onMount } from "svelte";

  // Equivalente de components/ui/scroll-progress.tsx (motion/react) sin
  // librería de animación: un listener de scroll + un porcentaje en CSS.
  let progress = $state(0);

  onMount(() => {
    const onScroll = () => {
      const altura = document.documentElement.scrollHeight - window.innerHeight;
      progress = altura > 0 ? Math.min(1, Math.max(0, window.scrollY / altura)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  });
</script>

<div
  class="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-[#AFEB17] to-[#F2C300]"
  style="transform: scaleX({progress}); transition: transform 80ms linear;"
></div>
