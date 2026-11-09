<script lang="ts">
  // Tienda de /productos: la casa solar interactiva (cada parte abre el
  // catálogo de su zona), la ficha del producto, el carrito y los avisos.
  import { onMount, untrack } from "svelte";
  import { carrito, cerrarCarrito, hidratarCarrito } from "~/lib/cart.svelte";
  import { ZONAS, type ZonaId } from "@/components/tienda/zonas";
  import { OFERTAS_PUBLICAS_QUERY, mapOfertaSimplificada } from "@/lib/ofertas/ofertas-publicas";
  import type { ArticuloTienda } from "@/types/tienda";
  import type { OfertaSimplificada } from "@/types/ofertas";
  import AvisoAgregado, { type Aviso } from "./AvisoAgregado.svelte";
  import CarritoBoton from "./CarritoBoton.svelte";
  import CarritoDrawer from "./CarritoDrawer.svelte";
  import CatalogoZona from "./CatalogoZona.svelte";
  import EscenaCasa from "./EscenaCasa.svelte";
  import FichaProducto from "./FichaProducto.svelte";
  import { useCatalogoWeb } from "./catalogo.svelte";
  import { useCompradosJuntos } from "./compradosJuntos.svelte";
  import { hidratarProvincia, provinciaTienda, useProvinciasConOferta } from "./provincia.svelte";

  interface Props {
    // null si el servidor no pudo traer los kits: entonces se piden desde aquí.
    initialKits: OfertaSimplificada[] | null;
    // /productos/[id]: la página llega con la ficha de ese producto ya abierta.
    initialProducto?: ArticuloTienda | null;
  }
  let { initialKits, initialProducto = null }: Props = $props();

  let kits = $state.raw<OfertaSimplificada[]>(untrack(() => initialKits) ?? []);
  let zona = $state<ZonaId | null>(null);
  let detalle = $state.raw<ArticuloTienda | null>(untrack(() => initialProducto));
  // Entró por /productos/<id> (Google, un enlace): no hay catálogo al que volver atrás.
  const entradaDirecta = untrack(() => initialProducto) !== null;
  let aviso = $state.raw<Aviso | null>(null);

  const zonaDelHash = (): ZonaId | null => {
    const h = window.location.hash.slice(1);
    return ZONAS.some((z) => z.id === h) ? (h as ZonaId) : null;
  };

  // Lo guardado en el navegador (carrito, provincia) se carga al montar: así el
  // HTML del servidor y la primera pintura coinciden. Va antes de los hooks
  // para que sus peticiones ya vean la provincia guardada.
  onMount(() => {
    hidratarCarrito();
    hidratarProvincia();
  });

  const provincia = $derived(provinciaTienda.provincia);
  const proveedor = useProvinciasConOferta();
  const provincias = $derived(proveedor.provincias);

  // Solo se manda la provincia si está confirmada en la lista con oferta: si la
  // tabla de disponibilidad aún no está poblada, `?provincia=03` dejaría el
  // catálogo vacío. Sin confirmación se pide el nacional, como siempre.
  const provinciaEfectiva = $derived(provincias.some((p) => p.codigo === provincia) ? provincia : null);
  const catalogo = useCatalogoWeb(() => provinciaEfectiva);

  // El catálogo abierto vive en el hash (/productos#inversor): el botón atrás
  // del móvil lo cierra en vez de salir de la página, y el enlace se comparte.
  onMount(() => {
    zona = zonaDelHash();
    // Cada ficha tiene su entrada en el historial (/productos/<id>) con el
    // producto guardado: atrás/adelante cambian de ficha o vuelven al catálogo.
    if (entradaDirecta) {
      window.history.replaceState({ __suncarFicha: true, n: 1, producto: $state.snapshot(detalle) }, "");
    }
    const alVolver = () => {
      const estado = window.history.state;
      if (estado?.__suncarFicha) {
        detalle = estado.producto;
        return;
      }
      detalle = null;
      zona = zonaDelHash();
    };
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  });

  function abrirZona(z: ZonaId) {
    // La marca dice si hay una entrada propia a la que volver al cerrar.
    if (zonaDelHash()) window.history.replaceState(window.history.state, "", `#${z}`);
    else window.history.pushState({ __suncarZona: true }, "", `#${z}`);
    zona = z;
  }

  // La ficha es una pantalla con URL propia (/productos/<id>) y entrada en el
  // historial: el botón atrás del móvil vuelve al catálogo. `n` cuenta las
  // fichas apiladas para cerrar de una vez, aunque se haya saltado entre recomendados.
  function abrirFicha(producto: ArticuloTienda) {
    const n = (window.history.state?.__suncarFicha ? window.history.state.n : 0) + 1;
    window.history.pushState(
      { __suncarFicha: true, n, producto: $state.snapshot(producto) },
      "",
      `/productos/${encodeURIComponent(producto.id)}`,
    );
    detalle = producto;
  }

  function cerrarFicha() {
    if (entradaDirecta) {
      window.location.assign("/productos");
      return;
    }
    const estado = window.history.state;
    if (estado?.__suncarFicha) window.history.go(-estado.n);
    else detalle = null;
  }

  function cerrarZona() {
    // Si se entró directo con el hash no hay entrada previa a la que volver.
    if (window.history.state?.__suncarZona) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    zona = null;
  }

  $effect(() => {
    if (untrack(() => initialKits) !== null) return;
    const controlador = new AbortController();
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`, {
      signal: controlador.signal,
    })
      .then((r) => r.json())
      .then((datos) => {
        if (datos?.success && Array.isArray(datos.data)) {
          kits = datos.data.map(mapOfertaSimplificada);
        }
      })
      .catch(() => {});
    return () => controlador.abort();
  });

  // La pestaña lleva el nombre del producto mientras su ficha está abierta.
  $effect(() => {
    const producto = detalle;
    if (!producto) return;
    const anterior = document.title;
    document.title = `${producto.modelo} | Suncar Cuba`;
    return () => {
      document.title = anterior;
    };
  });

  $effect(() => {
    const actual = aviso;
    if (!actual) return;
    const id = setTimeout(() => (aviso = null), actual.tipo === "ok" ? 1800 : 6000);
    return () => clearTimeout(id);
  });

  const nombreProvincia = (codigo: string) => provincias.find((p) => p.codigo === codigo)?.nombre ?? codigo;

  // Mezclar provincias en el carrito daría un pedido que nadie puede cotizar:
  // el precio y el vendedor cambian en cada una.
  function agregar(producto: ArticuloTienda) {
    const resultado = carrito.agregar(producto);
    if (resultado.ok) {
      aviso = { tipo: "ok", texto: producto.modelo, n: Date.now() };
      return;
    }
    aviso = {
      tipo: "provincia",
      n: Date.now(),
      texto:
        `Tu carrito tiene productos de ${nombreProvincia(resultado.provinciaCarrito)}. ` +
        `Para comprar en ${nombreProvincia(provincia)}, vacíalo primero.`,
    };
  }

  const comprados = useCompradosJuntos(
    () => detalle,
    () => provinciaEfectiva,
    () => catalogo.productos,
    () => kits,
  );
</script>

<main>
  {#if !detalle}
    <h1 class="sr-only">Tienda Suncar: toca cada parte de la casa para ver sus productos</h1>
  {/if}
  <section class="relative h-[100svh] min-h-[520px] overflow-hidden">
    <EscenaCasa onelegir={abrirZona} />
  </section>
</main>

{#if zona}
  <CatalogoZona
    zonaId={zona}
    productos={catalogo.productos}
    {kits}
    cargando={catalogo.cargando}
    error={catalogo.error}
    onreintentar={catalogo.reintentar}
    {provincia}
    {provincias}
    onprovincia={(codigo) => provinciaTienda.set(codigo)}
    oncambiar={abrirZona}
    oncerrar={cerrarZona}
    onagregar={agregar}
    onver={abrirFicha}
    atajoEscape={detalle === null}
  />
{/if}

<!-- Por encima del catálogo a pantalla completa -->
{#if detalle}
  <!-- key: al saltar a un recomendado, la ficha empieza de cero -->
  {#key detalle.id}
    <FichaProducto
      producto={detalle}
      onclose={cerrarFicha}
      recomendados={comprados.lista}
      onverrecomendado={abrirFicha}
      onagregarrecomendado={agregar}
    />
  {/key}
{/if}

<!-- En la casa el carrito está dibujado en la acera; en el catálogo, flotante -->
<CarritoDrawer
  provincia={provinciaEfectiva}
  catalogo={catalogo.productos}
  {kits}
  onagregar={agregar}
  onver={(p) => {
    cerrarCarrito();
    abrirFicha(p);
  }}
/>
{#if zona}
  <CarritoBoton />
{/if}

{#if aviso}
  <AvisoAgregado {aviso} />
{/if}
