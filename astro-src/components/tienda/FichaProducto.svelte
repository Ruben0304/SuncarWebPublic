<script lang="ts">
  // Ficha del producto a pantalla completa (no es un modal: en el móvil no se
  // usa bien): precios por volumen, carrito, compra por
  // WhatsApp, especificaciones y «Se suele comprar junto con».
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import ChevronLeft from "lucide-svelte/icons/chevron-left";
  import ChevronUp from "lucide-svelte/icons/chevron-up";
  import Info from "lucide-svelte/icons/info";
  import Minus from "lucide-svelte/icons/minus";
  import Package from "lucide-svelte/icons/package";
  import Plus from "lucide-svelte/icons/plus";
  import ShoppingCart from "lucide-svelte/icons/shopping-cart";
  import TrendingDown from "lucide-svelte/icons/trending-down";
  import Zap from "lucide-svelte/icons/zap";
  import { abrirCarrito, carrito } from "~/lib/cart.svelte";
  import { useContacto } from "~/lib/contacto.svelte";
  import { imagenResponsive } from "~/lib/imagenes";
  import TarjetaProducto from "./TarjetaProducto.svelte";
  import type { ArticuloTienda } from "@/types/tienda";

  interface Props {
    producto: ArticuloTienda;
    onclose: () => void;
    /** «Se suele comprar junto con»: sin ellos (o vacío) el bloque no sale. */
    recomendados?: ArticuloTienda[];
    onverrecomendado?: (producto: ArticuloTienda) => void;
    onagregarrecomendado?: (producto: ArticuloTienda) => void;
  }
  let { producto, onclose, recomendados = [], onverrecomendado, onagregarrecomendado }: Props = $props();

  let showAllSpecs = $state(false);
  let selectedQuantity = $state<string | null>(null);

  // Pantalla propia: bloquea el scroll de lo que hay debajo y Escape vuelve atrás.
  $effect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  });

  const quantityInCart = $derived(carrito.cantidadDe(producto.id));
  const datos = useContacto();

  // Precios por volumen, de menor a mayor cantidad.
  const preciosPorCantidad = $derived(
    producto.precio_por_cantidad
      ? Object.entries(producto.precio_por_cantidad).sort((a, b) => Number(a[0]) - Number(b[0]))
      : [],
  );

  // Especificaciones principales para mostrar primero (mínimo 2)
  const mainSpecsKeys = ["capacidad", "voltaje", "energia", "potencia", "peso_neto", "garantia", "con_bateria"];
  const allSpecEntries = $derived(Object.entries(producto.especificaciones || {}));
  const mainSpecs = $derived(allSpecEntries.filter(([key]) => mainSpecsKeys.includes(key)));
  const otherSpecs = $derived(allSpecEntries.filter(([key]) => !mainSpecsKeys.includes(key)));
  // Si hay menos de 2 specs principales, se toma de las otras.
  const visibleSpecs = $derived(mainSpecs.length >= 2 ? mainSpecs : allSpecEntries.slice(0, 2));
  const hiddenSpecs = $derived(mainSpecs.length >= 2 ? otherSpecs : allSpecEntries.slice(2));

  const precioActual = $derived(
    selectedQuantity && producto.precio_por_cantidad
      ? producto.precio_por_cantidad[selectedQuantity]
      : producto.precio,
  );
  const descuentoPorcentaje = $derived(
    selectedQuantity && producto.precio_por_cantidad
      ? Math.round(((producto.precio - producto.precio_por_cantidad[selectedQuantity]) / producto.precio) * 100)
      : 0,
  );

  const foto = $derived(producto.foto ? imagenResponsive(producto.foto, [640, 828, 1080]) : null);

  const formatSpecName = (key: string): string =>
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const formatSpecValue = (value: unknown): string => {
    if (typeof value === "boolean") return value ? "Sí" : "No";
    return String(value);
  };

  function handleWhatsAppContact() {
    const cantidadFinal = selectedQuantity ? parseInt(selectedQuantity) : quantityInCart || 1;
    const precioFinal =
      selectedQuantity && producto.precio_por_cantidad
        ? producto.precio_por_cantidad[selectedQuantity] * cantidadFinal
        : producto.precio * cantidadFinal;

    const descuentoTexto =
      selectedQuantity && descuentoPorcentaje > 0 ? ` (${descuentoPorcentaje}% descuento)` : "";

    const finalMessage =
      `Hola! Estoy interesado en comprar:\n\n` +
      `${producto.modelo}\n` +
      `Cantidad: ${cantidadFinal} ${producto.unidad}${cantidadFinal > 1 ? "s" : ""}\n` +
      `Precio: $${producto.precio.toLocaleString()} x ${cantidadFinal} = $${precioFinal.toLocaleString()}${descuentoTexto}\n\n` +
      `Podrian confirmar disponibilidad y coordinar la entrega?\n\nGracias!`;

    window.open(
      `https://wa.me/${datos.contacto.whatsapp}?text=${encodeURIComponent(finalMessage)}`,
      "_blank",
    );
  }

  function handleAddToCart() {
    const cantidad = selectedQuantity ? parseInt(selectedQuantity) : 1;
    carrito.agregar(producto, cantidad);
  }

  const BADGE =
    "inline-flex items-center rounded-full border border-transparent px-2 py-0.5 text-[10px] font-semibold text-white md:text-xs";
  const FILA_SPEC = "flex items-center justify-between border-b border-slate-100 py-2 md:py-2.5";
  const OPCION_VOLUMEN =
    "inline-flex h-auto items-center justify-between gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors md:py-2.5";
</script>

{#snippet verCarrito(ancho = "")}
  <button
    type="button"
    onclick={abrirCarrito}
    class={`${ancho} inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-primary bg-white px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:h-12 md:px-8 md:text-base`}
  >
    <ShoppingCart class="h-4 w-4" />
    Ver carrito · ${carrito.totalPrice.toLocaleString()}
  </button>
{/snippet}

{#snippet especificacion(clave: string, valor: unknown)}
  <div class={FILA_SPEC}>
    <span class="text-xs font-medium text-slate-700 md:text-sm">{formatSpecName(clave)}</span>
    <span class="text-xs font-semibold text-slate-900 md:text-sm">{formatSpecValue(valor)}</span>
  </div>
{/snippet}

<svelte:window onkeydown={(e) => e.key === "Escape" && onclose()} />

<div
  role="dialog"
  aria-modal="true"
  aria-label="Detalles del producto"
  class="fixed inset-0 z-[65] overflow-y-auto overscroll-contain bg-[#F2F2EF]"
>
  <!-- Header -->
  <div class="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
    <div class="mx-auto flex max-w-5xl items-center gap-3 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-6">
      <button
        type="button"
        onclick={onclose}
        aria-label="Volver"
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#012928] ring-1 ring-[#012928]/[0.08] transition-transform active:scale-90"
      >
        <ChevronLeft class="h-5 w-5" />
      </button>
      <div class="min-w-0 flex-1">
        <p class="text-base font-bold text-gray-900 md:text-xl">Detalles del Producto</p>
        <div class="mt-0.5 flex items-center gap-1.5">
          <span class={`${BADGE} bg-primary`}>{producto.categoria}</span>
          {#if producto.marca_nombre}
            <span class={`${BADGE} bg-blue-600`}>{producto.marca_nombre}</span>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Content -->
  <div class="mx-auto max-w-5xl p-3 pb-[max(2rem,env(safe-area-inset-bottom))] md:p-6 lg:p-8">
    <div class="grid gap-4 md:grid-cols-2 md:gap-8">
      <!-- Imagen del producto -->
      <div class="space-y-3 md:space-y-4">
        <div class="relative h-64 overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 md:h-80 md:rounded-2xl lg:h-96">
          {#if foto}
            <img
              src={foto.src}
              srcset={foto.srcset}
              sizes="(max-width: 768px) 90vw, 500px"
              alt={producto.modelo}
              loading="lazy"
              decoding="async"
              class="absolute inset-0 h-full w-full object-contain p-4 md:p-8"
            />
          {:else}
            <div class="flex h-full items-center justify-center">
              <Package class="h-16 w-16 text-gray-300 md:h-24 md:w-24" />
            </div>
          {/if}
        </div>
      </div>

      <!-- Información del producto -->
      <div class="space-y-4 md:space-y-6">
        <div>
          <h1 class="mb-2 text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">{producto.modelo}</h1>
          {#if producto.potenciaKW != null}
            <div class="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              <Zap class="h-4 w-4" />
              {producto.potenciaKW} kW
            </div>
          {/if}
          {#if producto.descripcion_uso}
            <p class="text-sm leading-relaxed text-gray-600 md:text-base">{producto.descripcion_uso}</p>
          {/if}
        </div>

        <!-- Precio -->
        <div class="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:rounded-2xl md:p-6">
          <div class="mb-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl">
              ${precioActual.toLocaleString()}
            </span>
            <span class="text-sm text-slate-600 md:text-base">/ {producto.unidad}</span>
          </div>

          {#if selectedQuantity && descuentoPorcentaje > 0}
            <div class="mb-3 flex items-center gap-2 md:mb-4">
              <span class="inline-flex items-center rounded-full border border-transparent bg-green-500 px-2.5 py-0.5 text-[10px] font-semibold text-white md:text-xs">
                <TrendingDown class="mr-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                {descuentoPorcentaje}% descuento
              </span>
              <span class="text-xs text-slate-500 line-through md:text-sm">
                ${producto.precio.toLocaleString()}
              </span>
            </div>
          {/if}

          <!-- Selector de cantidad si hay precios por volumen -->
          {#if preciosPorCantidad.length > 0}
            <div class="space-y-2 md:space-y-3">
              <span class="flex items-center gap-1.5 text-xs font-semibold text-slate-700 md:gap-2 md:text-sm">
                <TrendingDown class="h-3 w-3 md:h-4 md:w-4" />
                Descuentos por volumen:
              </span>
              <div class="grid grid-cols-2 gap-1.5 md:gap-2">
                <button
                  type="button"
                  onclick={() => (selectedQuantity = null)}
                  class={`${OPCION_VOLUMEN} ${
                    selectedQuantity === null
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span class="text-[10px] font-medium md:text-sm">1 {producto.unidad}</span>
                  <span class="text-[9px] font-semibold md:text-xs">${producto.precio.toLocaleString()}</span>
                </button>
                {#each preciosPorCantidad as [cantidad, precio] (cantidad)}
                  <button
                    type="button"
                    onclick={() => (selectedQuantity = cantidad)}
                    class={`${OPCION_VOLUMEN} ${
                      selectedQuantity === cantidad
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span class="text-[10px] font-medium md:text-sm">{cantidad}+ {producto.unidad}s</span>
                    <span class="text-[9px] font-semibold md:text-xs">${precio.toLocaleString()}</span>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>

        <!-- CTA Buttons -->
        <div class="space-y-2 md:space-y-3">
          {#if quantityInCart > 0}
            <div class="rounded-lg border border-primary/20 bg-primary/5 p-3 md:rounded-xl md:p-4">
              <div class="mb-2 flex items-center justify-between md:mb-3">
                <span class="text-xs font-semibold text-primary md:text-sm">En tu carrito:</span>
                <div class="flex items-center gap-1 rounded-lg border-2 border-primary bg-white px-1.5 py-0.5 md:gap-2 md:px-2 md:py-1">
                  <button
                    type="button"
                    onclick={() => carrito.cambiarCantidad(producto.id, quantityInCart - 1)}
                    aria-label="Quitar uno"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 md:h-8 md:w-8"
                  >
                    <Minus class="h-4 w-4 text-primary" />
                  </button>
                  <span class="w-8 text-center text-base font-bold text-primary md:w-12 md:text-lg">
                    {quantityInCart}
                  </span>
                  <button
                    type="button"
                    onclick={handleAddToCart}
                    aria-label="Agregar otro"
                    class="inline-flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 md:h-8 md:w-8"
                  >
                    <Plus class="h-4 w-4 text-primary" />
                  </button>
                </div>
              </div>
              <p class="text-[10px] text-slate-600 md:text-xs">
                Subtotal:
                <span class="font-bold text-primary">
                  ${(producto.precio * quantityInCart).toLocaleString()}
                </span>
              </p>
            </div>
          {/if}

          <div class="grid grid-cols-2 gap-2 md:gap-3">
            {#if quantityInCart === 0}
              <button
                type="button"
                onclick={handleAddToCart}
                class="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-primary bg-white px-8 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 md:h-12 md:text-base"
              >
                <Plus class="h-4 w-4" />
                Al Carrito
              </button>
            {/if}
            <button
              type="button"
              onclick={handleWhatsAppContact}
              class="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#012928] px-4 text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl md:h-12 md:px-8 md:text-base"
            >
              <ShoppingCart class="h-4 w-4" />
              Comprar ya
            </button>
            <!-- Con este producto en el carrito, «Ver carrito» ocupa el sitio de «Al Carrito» -->
            {#if quantityInCart > 0}
              {@render verCarrito()}
            {/if}
          </div>
          {#if quantityInCart === 0 && carrito.totalItems > 0}
            {@render verCarrito("w-full")}
          {/if}
        </div>

        <!-- Especificaciones técnicas -->
        {#if allSpecEntries.length > 0}
          <div class="border-t border-slate-200 pt-4 md:pt-6">
            <h4 class="mb-3 flex items-center gap-1.5 text-base font-bold text-slate-900 md:mb-4 md:gap-2 md:text-lg">
              <Info class="h-4 w-4 text-primary md:h-5 md:w-5" />
              Especificaciones Técnicas
            </h4>

            <div class="space-y-1.5 md:space-y-2">
              <!-- Especificaciones visibles (mínimo 2) -->
              {#each visibleSpecs as [key, value] (key)}
                {@render especificacion(key, value)}
              {/each}

              <!-- Especificaciones adicionales (colapsables) -->
              {#if hiddenSpecs.length > 0}
                <!-- Siempre en el HTML (Google las lee); plegadas hasta que se piden -->
                <div class:hidden={!showAllSpecs} class="space-y-1.5 md:space-y-2">
                  {#each hiddenSpecs as [key, value] (key)}
                    {@render especificacion(key, value)}
                  {/each}
                </div>

                <button
                  type="button"
                  onclick={() => (showAllSpecs = !showAllSpecs)}
                  class="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/5 md:mt-3 md:h-10 md:text-sm"
                >
                  {#if showAllSpecs}
                    <ChevronUp class="h-4 w-4" />
                    Ver menos especificaciones
                  {:else}
                    <ChevronDown class="h-4 w-4" />
                    Ver más especificaciones ({hiddenSpecs.length} adicionales)
                  {/if}
                </button>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>

    {#if recomendados.length > 0 && onverrecomendado && onagregarrecomendado}
      <div class="mt-6 border-t border-slate-200 pt-5 md:mt-8 md:pt-6">
        <h4 class="text-base font-bold text-slate-900 md:text-lg">Se suele comprar junto con</h4>
        <p class="mb-3 text-xs text-slate-500 md:mb-4 md:text-sm">
          Lo que otros clientes suelen llevar junto a este producto
        </p>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          {#each recomendados as p (p.id)}
            <TarjetaProducto producto={p} onagregar={onagregarrecomendado} onver={onverrecomendado} compacta />
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
