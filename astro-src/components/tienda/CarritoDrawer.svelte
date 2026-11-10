<script lang="ts">
  // Drawer lateral del carrito: productos, «Comprados juntos», oferta de
  // instalación y cotización por WhatsApp.
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import CreditCard from "lucide-svelte/icons/credit-card";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import MessageCircle from "lucide-svelte/icons/message-circle";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import Sparkles from "lucide-svelte/icons/sparkles";
  import Wrench from "lucide-svelte/icons/wrench";
  import X from "lucide-svelte/icons/x";
  import { carrito, carritoAbierto, cerrarCarrito } from "~/lib/cart.svelte";
  // La cotización se manda al contacto NACIONAL a propósito. Ya existe el
  // contacto por provincia en el backend y useContacto sabe pedirlo —acepta el
  // código de provincia como argumento—, pero todavía no está decidido qué
  // número atiende cada provincia, y mandar el pedido a un número sin dueño es
  // peor que mandarlo al central. Cuando se decida, es una línea:
  // useContacto(() => carrito.provincia).
  import type { ArticuloTienda } from "@/types/tienda";
  import type { OfertaSimplificada } from "@/types/ofertas";
  import { useContacto } from "~/lib/contacto.svelte";
  import CarritoItem from "./CarritoItem.svelte";
  import TarjetaProducto from "./TarjetaProducto.svelte";
  import { useCompradosJuntosCarrito } from "./compradosJuntos.svelte";
  import { useRecomendadorCarrito } from "./recomendadorCarrito.svelte";

  interface Props {
    provincia: string | null;
    catalogo: ArticuloTienda[];
    kits: OfertaSimplificada[];
    onagregar: (producto: ArticuloTienda) => void;
    onver: (producto: ArticuloTienda) => void;
  }
  let { provincia, catalogo, kits, onagregar, onver }: Props = $props();

  const datos = useContacto();
  // La oferta de instalación sale del recomendador del backend; «Comprados
  // juntos», igual que en la ficha del producto.
  const recomendador = useRecomendadorCarrito(carritoAbierto);
  const comprados = useCompradosJuntosCarrito(
    carritoAbierto,
    () => provincia,
    () => catalogo,
    () => kits,
  );

  const items = $derived(carrito.items);
  const totalItems = $derived(carrito.totalItems);

  // Un carrito con dos provincias no debería poder armarse (la guarda está en
  // el carrito), pero puede venir de localStorage de antes del cambio. Si pasa,
  // se bloquea el envío en vez de mandar un pedido que nadie puede cotizar.
  const carritoMixto = $derived(
    new Set(items.map((i) => i.producto.provincia).filter(Boolean)).size > 1,
  );

  // Bloquear scroll del body mientras el drawer está abierto.
  $effect(() => {
    if (!carritoAbierto()) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  });

  function handleWhatsAppCheckout() {
    if (carritoMixto) return;
    const productList = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.producto.modelo} - ${item.cantidad} ${item.producto.unidad}${item.cantidad > 1 ? "s" : ""}`,
      )
      .join("\n");

    const finalMessage =
      `Hola! Quiero cotizar la siguiente compra:\n\n` +
      productList +
      `\n\nEntiendo que el precio final depende de la cantidad, descuentos por volumen y recomendaciones técnicas del equipo.\n\n` +
      `¿Podrían confirmarme disponibilidad y enviarme una cotización personalizada?\n\nGracias!`;

    window.open(
      `https://wa.me/${datos.contacto.whatsapp}?text=${encodeURIComponent(finalMessage)}`,
      "_blank",
    );
  }
</script>

{#if carritoAbierto()}
  <!-- Backdrop oscuro -->
  <button
    type="button"
    class="fixed inset-0 z-[70] cursor-default bg-black/50 transition-opacity duration-300"
    aria-label="Cerrar carrito"
    tabindex="-1"
    onclick={cerrarCarrito}
  ></button>

  <!-- Drawer lateral derecho -->
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Mi carrito"
    class="animate-in slide-in-from-right fixed inset-y-0 right-0 z-[80] flex w-full flex-col bg-white shadow-2xl duration-300 sm:w-[480px] md:w-[520px]"
  >
    <!-- Header - compacto en móvil -->
    <div class="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
      <div class="flex items-center gap-2.5">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <ShoppingCart class="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 class="text-[15px] font-bold leading-tight text-slate-900">Mi Carrito</h2>
          {#if totalItems > 0}
            <p class="text-[11px] text-slate-400">
              {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </p>
          {/if}
        </div>
      </div>
      <button
        type="button"
        onclick={cerrarCarrito}
        class="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-slate-100 active:bg-slate-200"
        aria-label="Cerrar carrito"
      >
        <X class="h-5 w-5 text-slate-400" />
      </button>
    </div>

    <!-- Contenido scrolleable -->
    <div class="flex-1 overflow-y-auto">
      {#if items.length === 0}
        <!-- Estado vacío -->
        <div class="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingCart class="h-8 w-8 text-slate-300" />
          </div>
          <p class="mb-1 text-base font-semibold text-slate-800">Tu carrito está vacío</p>
          <p class="mb-5 max-w-[220px] text-[13px] text-slate-400">Agrega productos del catálogo para comenzar</p>
          <button
            type="button"
            onclick={cerrarCarrito}
            class="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[#012928] px-6 text-[13px] font-semibold text-white transition-all active:scale-[0.98]"
          >
            Explorar productos
          </button>
        </div>
      {:else}
        <!-- Lista de items -->
        <div class="divide-y divide-slate-100">
          {#each items as item, index (item.producto.id)}
            <CarritoItem {item} prioritaria={index < 3} />
          {/each}
        </div>

        <!-- Nota de precios -->
        <div class="mx-4 my-2.5 rounded-xl border border-[#F2C300]/30 bg-[#F2C300]/10 px-3 py-2.5">
          <p class="text-[11px] leading-relaxed text-[#F2C300]/80">
            Precios referenciales. El valor final varía según cantidad, volumen y configuración técnica.
          </p>
        </div>

        <!-- Sección de recomendados -->
        <div class="border-t border-slate-100 py-3">
          <div class="mb-2.5 flex items-center gap-2 px-4">
            <Sparkles class="h-3.5 w-3.5 text-primary" />
            <h3 class="text-[13px] font-semibold text-slate-800">Comprados juntos</h3>
          </div>

          {#if comprados.cargando}
            <div class="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
              <Loader2 class="h-3.5 w-3.5 animate-spin" />
              Buscando recomendaciones...
            </div>
          {:else if comprados.lista.length > 0}
            <div
              class="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-2"
              style="scrollbar-width: none; -webkit-overflow-scrolling: touch;"
            >
              {#each comprados.lista as producto, i (producto.id)}
                <TarjetaProducto
                  {producto}
                  {onagregar}
                  {onver}
                  compacta
                  prioritaria={i < 2}
                  class="w-[calc(50%-6px)] min-w-[calc(50%-6px)] flex-shrink-0 snap-start"
                />
              {/each}
              <!-- Spacer para que el último card no quede pegado al borde -->
              <div class="min-w-[1px] flex-shrink-0"></div>
            </div>
          {:else}
            <p class="px-4 py-2 text-xs text-slate-500">Aún no hay sugerencias para esta combinación.</p>
          {/if}
        </div>

        <!-- Sección de oferta de instalación -->
        <div class="border-t border-slate-100 px-4 py-3">
          <div class="mb-2 flex items-center gap-2">
            <div class="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10">
              <Wrench class="h-3.5 w-3.5 text-primary" />
            </div>
            <h3 class="text-[13px] font-semibold text-slate-800">Oferta de instalación</h3>
          </div>

          {#if recomendador.precioOferta != null}
            <div class="flex items-center justify-between rounded-xl border border-primary/10 bg-primary/5 p-3">
              <div>
                <p class="text-[10px] uppercase tracking-wide text-slate-500">Desde</p>
                <p class="text-base font-bold tabular-nums text-primary">
                  ${recomendador.precioOferta.toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onclick={() => {
                  if (recomendador.ofertaId) window.location.href = `/ofertas/${recomendador.ofertaId}`;
                }}
                disabled={!recomendador.ofertaId}
                class="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#012928] px-3 text-[11px] font-medium text-white transition-colors hover:bg-[#012928]/90 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
              >
                Ver oferta
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          {:else}
            <p class="py-1 text-[11px] text-slate-400">Sin oferta disponible para esta selección.</p>
          {/if}
        </div>

        <!-- Vaciar carrito -->
        <div class="border-t border-slate-100 px-4 py-3">
          <button
            type="button"
            onclick={() => carrito.vaciar()}
            class="text-[11px] text-slate-400 transition-colors active:text-red-500"
          >
            Vaciar carrito
          </button>
        </div>

        <div class="h-2"></div>
      {/if}
    </div>

    <!-- Footer fijo con resumen y checkout - safe area para iOS -->
    {#if items.length > 0}
      <div class="space-y-2.5 border-t border-slate-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <!-- Resumen en línea -->
        <div class="flex items-center justify-between">
          <div class="flex items-baseline gap-2">
            <p class="text-[11px] uppercase tracking-wide text-slate-400">Subtotal ref.</p>
            <p class="text-lg font-bold tabular-nums text-slate-900">${carrito.totalPrice.toLocaleString()}</p>
          </div>
          <span class="text-[11px] text-slate-400">
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
          </span>
        </div>

        {#if carritoMixto}
          <div class="rounded-xl border-2 border-amber-500 bg-amber-50 px-3 py-2.5">
            <p class="text-[13px] font-semibold text-amber-900">Tu carrito mezcla provincias</p>
            <p class="mt-0.5 text-[12px] text-amber-800">
              Los precios y el vendedor cambian según la provincia, así que no se puede cotizar un pedido mixto.
              Vacía el carrito y arma uno por provincia.
            </p>
            <button
              type="button"
              onclick={() => carrito.vaciar()}
              class="mt-2 text-[12px] font-semibold text-amber-900 underline"
            >
              Vaciar carrito
            </button>
          </div>
        {/if}

        <!-- CTA principal - altura 48px para mobile touch -->
        <button
          type="button"
          onclick={handleWhatsAppCheckout}
          disabled={carritoMixto}
          class="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#012928] px-4 text-[13px] font-semibold text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <MessageCircle class="h-4 w-4" />
          Solicitar cotización por WhatsApp
        </button>

        <!-- Pago online - secundario y compacto -->
        <span class="block w-full" title="El pago en línea estará disponible pronto">
          <button
            type="button"
            disabled
            class="inline-flex h-9 w-full cursor-not-allowed items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-xs font-medium text-slate-400 opacity-50"
          >
            <CreditCard class="h-4 w-4" />
            Pago en línea — Próximamente
          </button>
        </span>
      </div>
    {/if}
  </div>
{/if}
