"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import NavigationChristmas from "@/components/navigation-christmas";
import Footer from "@/components/footer";
import { isChristmasSeason } from "@/lib/christmas-utils";
import {
  ArrowLeft,
  Star,
  Phone,
  Loader2,
  ShoppingBag,
  MessageCircle,
  MapPin,
  Percent,
  Sparkles,
  Tag,
  Info,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Oferta, OfertaSimplificada } from "@/types/ofertas";
import { useClient } from "@/hooks/useClient";
import CurrencySelector from "@/components/CurrencySelector";
import { Currency } from "@/hooks/useCurrencyExchange";
import { useContacto } from "@/hooks/useContacto";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import ComoQuedaria from "@/components/ofertas/ComoQuedaria";
import { ModalElementos, ModalGarantias } from "@/components/ofertas/ModalesKit";
import OtrasConfiguraciones from "@/components/ofertas/OtrasConfiguraciones";
import { kitsConfigurables } from "@/lib/ofertas/configurador";
import {
  OFERTAS_PUBLICAS_QUERY,
  RUTA_TERMINOS_PUBLICOS,
  cargarPotencias,
  formatearPrecio,
  garantiaDeTerminos,
  idDeDetalle,
  mapOfertaDetalle,
  mapOfertasPublicas,
} from "@/lib/ofertas/ofertas-publicas";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";

// "Ver cómo quedaría" vive en el hash: el botón atrás del móvil la cierra en
// vez de salir de la oferta, y el enlace se puede compartir ya abierto.
const HASH_INSTALACION = "#como-quedaria";

interface OfertaDetalleProps {
  ofertaId: string;
  // null si el servidor no pudo traer la oferta: entonces se pide desde aquí.
  initialOferta: Oferta | null;
  // Los kits publicados, para mostrar sus otras configuraciones. null si el
  // servidor no pudo traerlos: entonces se piden desde aquí.
  ofertasPublicas?: OfertaSimplificada[] | null;
}

export default function OfertaDetalle({
  ofertaId,
  initialOferta,
  ofertasPublicas = null,
}: OfertaDetalleProps) {
  const { contacto } = useContacto();
  const router = useRouter();
  const [oferta, setOferta] = useState<Oferta | null>(initialOferta);
  const [loading, setLoading] = useState(initialOferta === null);
  const [error, setError] = useState<string | null>(null);
  const [listaKits, setListaKits] = useState<OfertaSimplificada[] | null>(ofertasPublicas);
  const [modal, setModal] = useState<"elementos" | "garantias" | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    initialOferta ? (initialOferta.moneda.toUpperCase() as Currency) : "EUR",
  );
  const [isChristmas, setIsChristmas] = useState(false);
  const [viendoInstalacion, setViendoInstalacion] = useState(false);
  const { isClient } = useClient();

  useEffect(() => {
    const sincronizar = () =>
      setViendoInstalacion(window.location.hash === HASH_INSTALACION);
    sincronizar();
    window.addEventListener("popstate", sincronizar);
    return () => window.removeEventListener("popstate", sincronizar);
  }, []);

  const abrirInstalacion = useCallback(() => {
    window.history.pushState({ __suncarVista: true }, "", HASH_INSTALACION);
    setViendoInstalacion(true);
  }, []);

  const cerrarInstalacion = useCallback(() => {
    // Si se entró directo con el hash no hay entrada previa a la que volver.
    if (window.history.state?.__suncarVista) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", window.location.pathname);
    setViendoInstalacion(false);
  }, []);

  // Check if it's Christmas season
  useEffect(() => {
    setIsChristmas(isChristmasSeason());
  }, []);

  const applyOfertaData = useCallback((data: Oferta) => {
    setOferta(data);
    setSelectedCurrency(data.moneda.toUpperCase() as Currency);
  }, []);

  const fetchOferta = useCallback(async () => {
    if (!ofertaId) {
      setError("ID de oferta no válido");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);

      // La URL lleva el número de oferta; el detalle se pide por su id.
      let id = idDeDetalle(ofertaId, null);
      if (!id) {
        const lista = await fetch(
          `${BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`,
        ).then((r) => (r.ok ? r.json() : null));
        id = idDeDetalle(ofertaId, lista?.data);
      }
      if (!id) {
        setError("Oferta no encontrada");
        return;
      }

      const [ofertaRes, terminosRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/ofertas/confeccion/${id}`),
        fetch(`${BACKEND_URL}${RUTA_TERMINOS_PUBLICOS}`),
      ]);

      if (!ofertaRes.ok) {
        setError(
          ofertaRes.status === 404
            ? "Oferta no encontrada"
            : `Error al cargar la oferta (${ofertaRes.status})`,
        );
        return;
      }

      const ofertaData = await ofertaRes.json();
      if (!ofertaData.success || !ofertaData.data) {
        setError(ofertaData.message || "Oferta no encontrada");
        return;
      }

      let garantiaTexto: string | null = null;
      if (terminosRes.ok) {
        try {
          garantiaTexto = garantiaDeTerminos(await terminosRes.json());
        } catch { /* no terminos disponibles */ }
      }

      applyOfertaData(mapOfertaDetalle(ofertaData.data, garantiaTexto));
    } catch (err) {
      console.error("Error fetching oferta:", err);
      setError("Error de conexión al cargar la oferta");
    } finally {
      setLoading(false);
    }
  }, [applyOfertaData, ofertaId]);

  useEffect(() => {
    if (initialOferta === null) {
      void fetchOferta();
    }
  }, [fetchOferta, initialOferta]);

  // Sin los kits del servidor, se piden aquí para poder ofrecer sus variantes.
  useEffect(() => {
    if (listaKits) return;
    let vigente = true;
    (async () => {
      try {
        const [respuesta, potencias] = await Promise.all([
          fetch(`${BACKEND_URL}/api/ofertas/confeccion/?${OFERTAS_PUBLICAS_QUERY}`),
          cargarPotencias(BACKEND_URL),
        ]);
        const datos = respuesta.ok ? await respuesta.json() : null;
        if (vigente && datos?.success && Array.isArray(datos.data)) {
          setListaKits(mapOfertasPublicas(datos.data, potencias));
        }
      } catch {
        // sin la lista no hay variantes que mostrar: el resto de la página sigue igual
      }
    })();
    return () => {
      vigente = false;
    };
  }, [listaKits]);

  const kits = useMemo(() => kitsConfigurables(listaKits ?? []), [listaKits]);
  const kitActual = useMemo(
    () =>
      kits.find(
        (k) =>
          k.id === ofertaId ||
          k.idInterno === ofertaId ||
          (oferta?.id != null && k.idInterno === oferta.id),
      ) ?? null,
    [kits, ofertaId, oferta?.id],
  );
  const formatCurrency = (moneda: string) => {
    if (moneda.toLowerCase() === "eur") return "EUR";
    if (moneda.toLowerCase() === "usd") return "USD";
    return moneda.toUpperCase();
  };

  const precioMostrado = oferta
    ? `${formatearPrecio(isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio)} ${formatCurrency(oferta.moneda)}`
    : "";
  const enlaceWhatsApp = (texto: string) =>
    `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
  const enlaceSolicitar = oferta
    ? enlaceWhatsApp(
        `Hola! Quiero solicitar el kit: ${oferta.descripcion} por ${precioMostrado}. ¿Podrían darme más información?`,
      )
    : "#";
  const enlaceAlternativa = oferta
    ? enlaceWhatsApp(
        `Hola! Me interesa el kit: ${oferta.descripcion} (${precioMostrado}), pero quisiera una configuración alternativa. ¿Podrían ayudarme?`,
      )
    : "#";

  return (
    <>
      {isChristmas ? <NavigationChristmas /> : <Navigation />}
      <div className="min-h-screen bg-[#F2F2EF] pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Ofertas
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className="flex items-center justify-center py-20"
            >
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-[#AFEB17] mx-auto mb-4" />
                <p className="text-lg text-gray-600">
                  Cargando detalles de la oferta...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-20">
              <Card className="max-w-lg mx-auto">
                <CardContent className="p-8">
                  <div className="text-red-500 mb-4">
                    <Star className="w-16 h-16 mx-auto" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Oferta no encontrada
                  </h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => router.back()}>
                      Volver atrás
                    </Button>
                    <Button
                      onClick={() => {
                        void fetchOferta();
                      }}
                      className="bg-gradient-to-r from-[#AFEB17] to-[#F2C300] hover:from-[#e55a1f] hover:to-[#e6a610] text-white"
                    >
                      Intentar de nuevo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Oferta Details */}
          {!loading && !error && oferta && (
            <div className="space-y-8">
              {/* Header Card */}
              <Card className="overflow-hidden">
                {/* Image Section */}
                <div className="relative h-64 md:h-80 lg:h-[28rem] overflow-hidden bg-[#F2F2EF]">
                  <Image
                    src={oferta.imagen || "/placeholder.svg"}
                    alt={oferta.descripcion}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1280px"
                    quality={75}
                    fetchPriority="high"
                    className="object-contain md:object-contain"
                    priority
                  />
                  {/* Status badges - top left corner */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {/* Sold Out Badge - for inactive offers */}
                    {oferta.is_active === false && (
                      <Badge className="bg-gray-600 text-white px-4 py-2 text-base font-bold shadow-xl border-2 border-white">
                        AGOTADA
                      </Badge>
                    )}

                    {/* Discount or Special Offer Badge */}
                    {oferta.descuentos && oferta.descuentos.trim() !== "" ? (
                      <Badge className="bg-gradient-to-r from-[#AFEB17]/50 to-red-500 text-white font-bold px-4 py-2 shadow-xl border-2 border-white flex items-center gap-2">
                        <Percent className="w-4 h-4" />
                        CON DESCUENTO
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-400 text-black font-bold px-3 py-1 shadow-lg">
                        OFERTA ESPECIAL
                      </Badge>
                    )}
                  </div>

                  {oferta.marca && (
                    <div className="absolute bottom-4 left-4">
                      <div className="inline-flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[#012928] shadow-lg">
                        <Sparkles className="h-5 w-5 text-[#AFEB17]" />
                        Marca certificada: {oferta.marca}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section - Below Image */}
                <div className="p-6 md:p-8 lg:p-10 bg-white">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#012928] mb-6 leading-tight">
                    {oferta.descripcion}
                  </h1>

                  {oferta.marca && (
                    <div className="mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-[#012928] border-opacity-10 bg-gradient-to-r from-[#F4F7FF] to-[#EAF3FF] px-4 py-3 shadow-sm">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#012928] shadow">
                          <Sparkles className="h-4 w-4 text-[#AFEB17]" />
                          Marca aliada
                        </div>
                        <p className="text-sm sm:text-base text-[#012928] opacity-80">
                          {oferta.marca} respalda este sistema con componentes
                          seleccionados y certificaciones vigentes.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Price Display - Sin conversión de moneda (API agotada) */}
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#AFEB17]">
                        {formatearPrecio(isClient && oferta.precio_cliente
                          ? oferta.precio_cliente
                          : oferta.precio)}{" "}
                        {formatCurrency(oferta.moneda)}
                      </div>

                      {/* Show original price if there's a client discount */}
                      {isClient && oferta.precio_cliente && (
                        <div className="text-xl sm:text-2xl md:text-3xl text-gray-500 line-through">
                          {formatearPrecio(oferta.precio)}{" "}
                          {formatCurrency(oferta.moneda)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          asChild
                          size="lg"
                          className="w-full rounded-full bg-[#012928] px-8 font-semibold text-white shadow-lg hover:bg-[#012928]/90 sm:w-auto"
                        >
                          <a
                            href={enlaceSolicitar}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <WhatsAppIcon className="h-5 w-5" />
                            Solicitar kit
                          </a>
                        </Button>
                        <Button
                          asChild
                          size="lg"
                          variant="outline"
                          className="h-auto w-full whitespace-normal rounded-full border-[#012928] px-8 py-3 text-center font-semibold text-[#012928] hover:bg-[#012928]/5 sm:w-auto"
                        >
                          <a
                            href={enlaceAlternativa}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Contactar para una configuración alternativa
                          </a>
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setModal("elementos")}
                          className="rounded-full"
                        >
                          Ver qué trae el kit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setModal("garantias")}
                          className="rounded-full"
                        >
                          Ver garantías del kit
                        </Button>
                        {oferta.instalacion && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={abrirInstalacion}
                            className="rounded-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Ver cómo quedaría
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Financing Information */}
                    {/* TEMPORALMENTE COMENTADO
                    {oferta.financiamiento && (
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-gray-700">
                          <span className="text-base sm:text-lg">o desde</span>
                          <span className="text-xl sm:text-2xl font-bold text-[#012928]">78 €/mes</span>
                          <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full w-fit">
                            <MapPin className="w-4 h-4" />
                            <span>solo desde España</span>
                          </div>
                        </div>
                      </div>
                    )}
                    */}
                  </div>
                </div>
              </Card>

              {/* Discount Information Section */}
              {oferta.descuentos && oferta.descuentos.trim() !== "" && (
                <Card
                  className="bg-gradient-to-r from-[#AFEB17]/5 via-red-50 to-pink-50 border-2 border-[#AFEB17]/25 shadow-xl overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-[#AFEB17]/10 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                  <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl text-[#012928]">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#AFEB17]/50 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <Percent className="w-6 h-6 text-white" />
                      </div>
                      ¡Descuentos Especiales Disponibles!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#AFEB17]/25 shadow-md">
                      <div className="flex items-start gap-3 mb-3">
                        <Tag className="w-5 h-5 text-[#012928] mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {oferta.descuentos}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-[#AFEB17]/15">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Info className="w-4 h-4 text-[#AFEB17]" />
                          Contacta con nosotros para más detalles sobre estos
                          descuentos y cómo aplicarlos.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Currency Selector Section - COMENTADO: API agotada */}
              {/* <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Seleccionar Moneda
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Elige la moneda para ver el precio convertido
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <CurrencySelector
                        baseCurrency={oferta.moneda.toUpperCase() as Currency}
                        selectedCurrency={selectedCurrency}
                        onCurrencyChange={setSelectedCurrency}
                        basePrice={isClient && oferta.precio_cliente ? oferta.precio_cliente : oferta.precio}
                        size="lg"
                        showConvertedPrice={true}
                        className="[&_button]:bg-white [&_button]:border-gray-300 [&_button]:hover:bg-gray-50 [&_button]:shadow-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              <OtrasConfiguraciones
                actual={kitActual}
                kits={kits}
                moneda={formatCurrency(oferta.moneda)}
              />

              {/* PDF Ficha Técnica Section */}
              {oferta.pdf && oferta.pdf.trim() !== "" && (
                <Card
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                  <CardContent className="p-6 md:p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-blue-800 mb-2">
                            Ficha Técnica Completa
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            Descarga el documento PDF con toda la información
                            técnica detallada de esta oferta, incluyendo
                            especificaciones, características y
                            certificaciones.
                          </p>
                        </div>
                      </div>
                      <div className="w-full md:w-auto">
                        <Button
                          asChild
                          size="lg"
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <a
                            href={oferta.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2"
                          >
                            <Download className="w-5 h-5" />
                            Descargar PDF
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Service Coverage Information */}
              <Card
                className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-lg overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-green-100/30 rounded-full -translate-y-20 translate-x-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100/30 rounded-full translate-y-16 -translate-x-16"></div>

                <CardContent className="p-6 md:p-8 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-green-800 mb-3">
                        Cobertura de Servicio
                      </h3>
                      <div className="space-y-3 text-gray-700">
                        <p className="leading-relaxed">
                          <span className="font-semibold text-green-700">
                            Servicio garantizado en La Habana:
                          </span>{" "}
                          Ofrecemos cobertura completa en todos los municipios
                          de la capital.
                        </p>
                        <p className="leading-relaxed text-gray-600">
                          <span className="font-medium text-gray-700">
                            Otras provincias:
                          </span>{" "}
                          Evaluamos cada caso de forma individual. Por favor,
                          contáctenos indicando su provincia para coordinar
                          las opciones disponibles y brindarle la mejor
                          solución para su proyecto de energía solar.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button
                  asChild
                  variant="ghost"
                  className="rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                >
                  <Link href="/ofertas">Ver más kits</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {oferta && (
        <>
          <ModalElementos
            oferta={oferta}
            descripcion={oferta.descripcion}
            abierto={modal === "elementos"}
            onCerrar={() => setModal(null)}
          />
          <ModalGarantias
            oferta={oferta}
            descripcion={oferta.descripcion}
            abierto={modal === "garantias"}
            onCerrar={() => setModal(null)}
          />
        </>
      )}

      {viendoInstalacion && oferta?.instalacion && (
        <ComoQuedaria
          kit={oferta.instalacion}
          nombre={oferta.descripcion}
          onCerrar={cerrarInstalacion}
          accion={
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#012928] font-semibold text-white shadow-lg hover:bg-[#012928]/90 sm:w-auto"
            >
              <a
                href={enlaceSolicitar}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Solicitar kit
              </a>
            </Button>
          }
        />
      )}
    </>
  );
}
