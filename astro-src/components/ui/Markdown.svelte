<script lang="ts">
  import { markdownAHtml } from "~/lib/markdown";

  interface Props {
    texto: string;
    class?: string;
  }
  let { texto, class: className = "" }: Props = $props();

  let html = $state("");

  // Los efectos no corren en el servidor: el HTML se arma ya en el navegador.
  $effect(() => {
    const fuente = texto;
    let vivo = true;
    markdownAHtml(fuente).then((resultado) => {
      if (vivo) html = resultado;
    });
    return () => {
      vivo = false;
    };
  });
</script>

<div class={className}>{@html html}</div>
