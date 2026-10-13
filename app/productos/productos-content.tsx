"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, MapPin } from "lucide-react";
import Navigation from "@/components/navigation";
import NavigationChristmas from "@/components/navigation-christmas";
import Footer from "@/components/footer";
import FooterChristmas from "@/components/footer-christmas";
import ProductDetailModal from "@/components/ProductDetailModal";
import ShoppingCartComponent from "@/components/ShoppingCart";
import EscenaCasa from "@/components/tienda/EscenaCasa";
import CatalogoZona from "@/components/tienda/CatalogoZona";
import { ZONAS, type ZonaId } from "@/components/tienda/zonas";
import { compradosJuntos } from "@/components/tienda/comprados-juntos";
import t from "@/components/tienda/tienda.module.css";
import { useCart } from "@/hooks/useCart";
import { useCatalogoWeb } from "@/hooks/useCatalogoWeb";
import { useProvinciaTienda, useProvinciasConOferta } from "@/hooks/useProvinciaTienda";
import { isChristmasSeason } from "@/lib/christmas-utils";
import { OFERTAS_PUBLICAS_QUERY, mapOfertaSimplificada } from "@/lib/ofertas/ofertas-publicas";
import type { ArticuloTienda } from "@/types/tienda";
import type { OfertaSimplificada } from "@/types/ofertas";

interface ProductosContentProps {
  // null si el servidor no pudo traer los kits: entonces se piden desde aquí.
  initialKits: OfertaSimplificada[] | null;
}

type Aviso = { tipo: "ok" | "provincia"; texto: string; n: number } | null;

const zonaDelHash = (): ZonaId | null => {
  const h = window.location.hash.slice(1);
  return ZONAS.some((z) => z.id === h) ? (h as ZonaId) : null;
};

export default function ProductosContent({ initialKits }: ProductosContentProps) {
  const [isChristmas, setIsChristmas] = useState(false);
  const [kits, setKits] = useState<OfertaSimplificada[]>(initialKits ?? []);
  const [zona, setZona] = useState<ZonaId | null>(null);
  const [detalle, setDetalle] = useState<ArticuloTienda | null>(null);
  const [aviso, setAviso] = useState<Aviso>(null);

  const addItem = useCart((s) => s.addItem);
  const { provincia, setProvincia } = useProvinciaTienda();
  const { provincias } = useProvinciasConOferta();

  // Solo se manda la provincia si está confirmada en la lista con oferta: si la
  // tabla de disponibilidad aún no está poblada, `?provincia=03` dejaría el
  // catálogo vacío. Sin confirmación se pide el nacional, como siempre.
  const provinciaEfectiva = provincias.some((p) => p.codigo === provincia) ? provincia : null;
  const { productos, cargando, error, reintentar } = useCatalogoWeb(provinciaEfectiva);

  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  // El catálogo abierto vive en el hash (/productos#inversor): el botón atrás
  // del móvil lo cierra en vez de salir de la página, y el enlace se comparte.
  useEffect(() => {
    setZona(zonaDelHash());
    const alVolver = () => setZona(zonaDelHash());
    window.addEventListener("popstate", alVolver);
    return () => window.removeEventListener("popstate", alVolver);
  }, []);

  const abrirZona = useCallback((z: ZonaId) => {
    // La marca dice si hay una entrada propia a la que volver al cerrar.
    if (zonaDelHash()) window.history.replaceState(window.history.state, "", `#${z}`);
    else window.history.pushState({ __suncarZona: true }, "", `#${z}`);
    setZona(z);
  }, []);

  const cerrarZona = useCallback(() => {
    // Si se entró directo con el hash no hay entrada previa a la que volver.
    if (window.history.state?.__suncarZona) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    setZona(null);
  }, []);

  useEffect(() => {
    if (initialKits !== null) return;
    const controlador = new AbortController();
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`,
      { signal: controlador.signal },
    )
      .then((r) => r.json())
      .then((datos) => {
        if (datos?.success && Array.isArray(datos.data)) {
          setKits(datos.data.map(mapOfertaSimplificada));
        }
      })
      .catch(() => {});
    return () => controlador.abort();
  }, [initialKits]);

  useEffect(() => {
    if (!aviso) return;
    const id = setTimeout(() => setAviso(null), aviso.tipo === "ok" ? 1800 : 6000);
    return () => clearTimeout(id);
  }, [aviso]);

  const nombreProvincia = useCallback(
    (codigo: string) => provincias.find((p) => p.codigo === codigo)?.nombre ?? codigo,
    [provincias],
  );

  // Mezclar provincias en el carrito daría un pedido que nadie puede cotizar:
  // el precio y el vendedor cambian en cada una.
  const agregar = useCallback(
    (producto: ArticuloTienda) => {
      const resultado = addItem(producto);
      if (resultado.ok) {
        setAviso({ tipo: "ok", texto: producto.modelo, n: Date.now() });
        return;
      }
      setAviso({
        tipo: "provincia",
        n: Date.now(),
        texto:
          `Tu carrito tiene productos de ${nombreProvincia(resultado.provinciaCarrito)}. ` +
          `Para comprar en ${nombreProvincia(provincia)}, vacíalo primero.`,
      });
    },
    [addItem, nombreProvincia, provincia],
  );

  const recomendados = useMemo(
    () => (detalle ? compradosJuntos(detalle, productos, kits) : []),
    [detalle, productos, kits],
  );

  return (
    <div className="min-h-screen bg-[#F2F2EF]">
      {isChristmas ? <NavigationChristmas /> : <Navigation />}

      <main>
        <h1 className="sr-only">Tienda Suncar: toca cada parte de la casa para ver sus productos</h1>
        <section className="relative h-[100svh] min-h-[520px] overflow-hidden">
          <EscenaCasa onElegir={abrirZona} />
        </section>
      </main>

      {isChristmas ? <FooterChristmas /> : <Footer />}

      {zona && (
        <CatalogoZona
          zonaId={zona}
          productos={productos}
          kits={kits}
          cargando={cargando}
          error={error}
          onReintentar={reintentar}
          provincia={provincia}
          provincias={provincias}
          onProvincia={setProvincia}
          onCambiar={abrirZona}
          onCerrar={cerrarZona}
          onAgregar={agregar}
          onVer={setDetalle}
        />
      )}

      {/* Por encima del catálogo a pantalla completa */}
      {detalle && (
        <div className="relative z-[90]">
          {/* key: al saltar a un recomendado, la ficha empieza de cero */}
          <ProductDetailModal
            key={detalle.id}
            producto={detalle}
            onClose={() => setDetalle(null)}
            recomendados={recomendados}
            onVerRecomendado={setDetalle}
            onAgregarRecomendado={agregar}
          />
        </div>
      )}

      {/* En la casa el carrito está dibujado en la acera; en el catálogo, flotante */}
      <ShoppingCartComponent ocultarBoton={!zona} />

      {aviso && (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4"
        >
          <div
            key={aviso.n}
            className={`${t.entrar} flex w-full max-w-[380px] items-center gap-3 rounded-full bg-[#012928] py-2 pl-2 pr-5 text-white shadow-[0_16px_40px_-12px_rgba(1,41,40,0.6)]`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#012928] ${
                aviso.tipo === "ok" ? "bg-[#AFEB17]" : "bg-[#F2C300]"
              }`}
            >
              {aviso.tipo === "ok" ? <Check className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
            </span>
            <p className="min-w-0 text-[13px] leading-snug">
              {aviso.tipo === "ok" ? (
                <>
                  <span className="font-semibold">Agregado</span>
                  <span className="block truncate text-white/60">{aviso.texto}</span>
                </>
              ) : (
                aviso.texto
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
