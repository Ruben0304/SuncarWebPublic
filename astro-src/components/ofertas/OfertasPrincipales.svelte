<script lang="ts">
  // «Ofertas principales»: los kits que el equipo marcó con una etiqueta («Más vendida», «Del momento»…)
  // pasando en una fila que se mueve sola, encima de «Comprar un kit». Ahí las etiquetas no se ven en las
  // tarjetas del listado, que solo se abre desde el pie del configurador. Elegir uno deja el configurador en
  // ese kit. Se detiene al pasar el ratón o al enfocar una tarjeta, y quien pide menos movimiento
  // (`prefers-reduced-motion`) la ve quieta y con scroll a mano.
  import { formatearPrecio } from "@/lib/ofertas/ofertas-publicas";
  import type { EtiquetaOferta, OfertaSimplificada } from "@/types/ofertas";
  import { atributosImagen } from "./imagen";
  import ChipVoltaje from "./ChipVoltaje.svelte";

  interface Props {
    ofertas: OfertaSimplificada[];
    onelegir: (id: string) => void;
  }
  let { ofertas, onelegir }: Props = $props();

  // Fondo y texto de cada color de etiqueta: los mismos de los listones de las tarjetas.
  const ESTILOS: Record<EtiquetaOferta["color"], { fondo: string; texto: string }> = {
    volt: { fondo: "#AFEB17", texto: "#012928" },
    solar: { fondo: "#F2C300", texto: "#012928" },
    esmeralda: { fondo: "#012928", texto: "#AFEB17" },
    medianoche: { fondo: "#0A052D", texto: "#F2C300" },
  };

  // Primero las de más prioridad de etiqueta.
  const principales = $derived(
    ofertas
      .filter((o) => o.id && o.is_active !== false && o.etiquetas?.length)
      .sort((a, b) => (b.etiquetas?.[0]?.prioridad ?? 0) - (a.etiquetas?.[0]?.prioridad ?? 0)),
  );

  // Con una sola tarjeta no hay nada que pasar. Con más, la pista lleva la fila dos veces para que el
  // recorrido cierre sin saltos; y cada mitad se repite lo necesario para ser más ancha que la pantalla
  // (con pocos kits, si no, quedarían huecos). Lo repetido va oculto para los lectores de pantalla.
  const ANCHO_TARJETA = 188; // w-44 (176) + el hueco (12)
  const seMueve = $derived(principales.length >= 2);
  const repeticiones = $derived(Math.max(1, Math.ceil(1600 / (principales.length * ANCHO_TARJETA))));
  const mitad = $derived(Array.from({ length: repeticiones }, () => principales).flat());
  const pista = $derived(seMueve ? [...mitad, ...mitad] : principales);
  // Unos 5 s por tarjeta de la mitad visible, como mínimo 25 s: ni tan rápido que no se lea ni tan lento
  // que parezca parado.
  const duracion = $derived(`${Math.max(25, principales.length * 5)}s`);
</script>

{#if principales.length > 0}
  <section aria-label="Ofertas principales" class="mx-auto mb-6 max-w-6xl">
    <h2 class="mb-2 px-4 text-sm font-semibold text-[#012928]">Ofertas principales</h2>

    <div class="principales relative overflow-hidden" class:se-mueve={seMueve}>
      <ul
        class="pista flex w-max gap-3 px-4 py-1"
        style={`--duracion: ${duracion}`}
      >
        {#each pista as o, i (`${o.id}-${i}`)}
          {@const etiqueta = o.etiquetas![0]}
          {@const estilo = ESTILOS[etiqueta.color]}
          {@const copia = seMueve && i >= principales.length}
          {@const foto = atributosImagen(o.imagen || "/placeholder.svg", { width: 176 })}
          <li class="w-44 shrink-0" aria-hidden={copia ? "true" : undefined}>
            <button
              type="button"
              tabindex={copia ? -1 : undefined}
              onclick={() => onelegir(o.id as string)}
              class="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#012928]"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-[#F5F5F7]">
                <img
                  src={foto.src}
                  srcset={foto.srcset}
                  sizes={foto.sizes}
                  alt={copia ? "" : o.descripcion}
                  loading="lazy"
                  decoding="async"
                  class="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  class="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase leading-none tracking-[0.08em] shadow-sm"
                  style={`background: ${estilo.fondo}; color: ${estilo.texto};`}
                >
                  {etiqueta.texto}
                </span>
              </div>
              <div class="flex flex-1 flex-col justify-between p-3">
                <p class="line-clamp-2 min-h-[2.4em] text-xs font-medium leading-snug text-[#012928]">{o.descripcion}</p>
                <div class="mt-2 flex items-center justify-between gap-2">
                  <p class="text-sm font-bold text-[#012928]">
                    {formatearPrecio(o.precio)} <span class="text-[10px] font-semibold">{o.moneda?.toUpperCase()}</span>
                  </p>
                  <ChipVoltaje voltaje={o.voltaje} />
                </div>
              </div>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </section>
{/if}

<style>
  /* Sin movimiento: fila quieta con scroll a mano. */
  .principales {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .principales.se-mueve {
    overflow: hidden;
    /* Se desvanece en los bordes para que las tarjetas entren y salgan sin cortes. */
    mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
  }
  @media (prefers-reduced-motion: no-preference) {
    .se-mueve .pista {
      animation: pasar var(--duracion) linear infinite;
    }
    /* Quieta mientras se mira una tarjeta o se navega con el teclado. */
    .se-mueve:hover .pista,
    .se-mueve:focus-within .pista {
      animation-play-state: paused;
    }
  }
  /* Con movimiento reducido no hay animación: la copia sobra y se ve con scroll. */
  @media (prefers-reduced-motion: reduce) {
    .principales.se-mueve {
      overflow-x: auto;
      mask-image: none;
    }
  }
  /* La pista lleva la fila dos veces: recorrer la mitad y volver al inicio no se nota. */
  @keyframes pasar {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(-50% - 0.375rem));
    }
  }
</style>
