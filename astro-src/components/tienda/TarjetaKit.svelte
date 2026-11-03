<script lang="ts">
  import ArrowUpRight from "lucide-svelte/icons/arrow-up-right";
  import { imagenResponsive } from "~/lib/imagenes";
  import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
  import { nombreKit } from "./nombreKit";
  import type { OfertaSimplificada } from "@/types/ofertas";

  interface Props {
    kit: OfertaSimplificada;
    class?: string;
    style?: string;
  }
  let { kit, class: className = "", style }: Props = $props();

  const imagen = $derived(kit.imagen ? imagenResponsive(kit.imagen, [384, 640, 828]) : null);
  const clases = $derived(
    `group flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-[#012928]/[0.06] shadow-[0_10px_30px_-18px_rgba(1,41,40,0.45)] ${className}`,
  );
</script>

{#snippet contenido()}
  <div class="relative aspect-[4/3] w-full overflow-hidden bg-[#0A052D]">
    {#if imagen}
      <img
        src={imagen.src}
        srcset={imagen.srcset}
        sizes="(max-width: 768px) 75vw, 300px"
        alt=""
        loading="lazy"
        decoding="async"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    {/if}
    <div class="absolute inset-0 bg-gradient-to-t from-[#012928]/85 via-[#012928]/10 to-transparent"></div>
    {#if kit.potenciaInversor}
      <span class="absolute left-3 top-3 rounded-full bg-gradient-to-r from-[#AFEB17] to-[#F2C300] px-2.5 py-1 text-[11px] font-bold text-[#012928]">
        {kit.potenciaInversor}
      </span>
    {/if}
    {#if kit.descuentos}
      <span class="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#012928]">
        {kit.descuentos}
      </span>
    {/if}
    <div class="absolute inset-x-0 bottom-0 p-4">
      <p class="line-clamp-2 text-[13px] font-medium leading-snug text-white/90">{nombreKit(kit)}</p>
    </div>
  </div>
  <div class="flex items-center justify-between gap-2 px-4 py-3">
    <div>
      <span class="text-xl font-bold tabular-nums text-[#012928]">${formatearPrecio(kit.precio)}</span>
      <span class="ml-1 text-[11px] text-slate-400">{kit.moneda} · con instalación</span>
    </div>
    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2EF] text-[#012928] transition-colors group-hover:bg-[#012928] group-hover:text-white">
      <ArrowUpRight class="h-4 w-4" />
    </span>
  </div>
{/snippet}

{#if kit.id}
  <a href={`/ofertas/${encodeURIComponent(kit.id)}`} class={clases} {style}>
    {@render contenido()}
  </a>
{:else}
  <div class={clases} {style}>
    {@render contenido()}
  </div>
{/if}
