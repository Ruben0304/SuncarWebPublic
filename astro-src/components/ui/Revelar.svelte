<script lang="ts">
  import { onMount } from "svelte";
  import type { Snippet } from "svelte";

  interface Props {
    retraso?: number;
    class?: string;
    children: Snippet;
  }
  let { retraso = 0, class: className = "", children }: Props = $props();

  let el: HTMLDivElement | null = $state(null);
  let visible = $state(false);

  onMount(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        visible = true;
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={el}
  style={`transition-delay: ${visible ? retraso : 0}ms`}
  class={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
    visible
      ? "translate-y-0 scale-100 opacity-100"
      : "translate-y-8 scale-95 opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100"
  }`}
>
  {@render children()}
</div>
