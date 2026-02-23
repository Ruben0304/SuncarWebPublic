'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArticuloTienda } from '@/types/tienda';
import Link from 'next/link';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MessageCircle,
  Loader2,
  Sparkles,
  Wrench,
  ChevronRight,
  Package,
} from 'lucide-react';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Variable global para compartir el estado del carrito
let cartOpenState = false;
export const getCartOpenState = () => cartOpenState;

interface RecomendadorCarritoResponse {
  success: boolean;
  message: string;
  data: {
    oferta_id: string | null;
    precio_oferta: number | null;
    productos: ArticuloTienda[];
    productos_no_vendibles_extra: ArticuloTienda[];
    coincidencias_carrito: number;
  };
}

const MAX_PRODUCTOS_RECOMENDADOS = 5;
type ProductoRecomendado = ArticuloTienda & { vendible: boolean };

export default function ShoppingCartComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [recomendados, setRecomendados] = useState<ProductoRecomendado[]>([]);
  const [ofertaId, setOfertaId] = useState<string | null>(null);
  const [precioOferta, setPrecioOferta] = useState<number | null>(null);
  const [recomendadorLoading, setRecomendadorLoading] = useState(false);

  // Actualizar el estado global cuando cambie
  useEffect(() => {
    cartOpenState = isOpen;
  }, [isOpen]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setRecomendados([]);
      setOfertaId(null);
      setPrecioOferta(null);
      return;
    }

    const controller = new AbortController();

    const fetchRecomendaciones = async () => {
      setRecomendadorLoading(true);
      try {
        const idsUnicos = Array.from(
          new Set(items.map((item) => item.producto.id).filter(Boolean)),
        );

        const response = await fetch('/api/ofertas/confeccion/recomendador-carrito', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productos: idsUnicos.map((id) => ({ id })),
            max_productos: MAX_PRODUCTOS_RECOMENDADOS,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('No se pudieron obtener recomendaciones del carrito');
        }

        const payload = (await response.json()) as RecomendadorCarritoResponse;
        const data = payload?.data;
        const productos = Array.isArray(data?.productos) ? data.productos : [];
        const noVendiblesExtra = Array.isArray(data?.productos_no_vendibles_extra)
          ? data.productos_no_vendibles_extra
          : [];
        const noVendiblesIds = new Set(noVendiblesExtra.map((p) => p.id));

        const recomendadosConEstado: ProductoRecomendado[] = productos.map((p) => ({
          ...p,
          vendible: !noVendiblesIds.has(p.id),
        }));

        noVendiblesExtra.forEach((p) => {
          if (!recomendadosConEstado.some((item) => item.id === p.id)) {
            recomendadosConEstado.push({ ...p, vendible: false });
          }
        });

        setRecomendados(recomendadosConEstado);
        setOfertaId(data?.oferta_id ?? null);
        setPrecioOferta(
          typeof data?.precio_oferta === 'number' ? data.precio_oferta : null,
        );
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setRecomendados([]);
          setOfertaId(null);
          setPrecioOferta(null);
        }
      } finally {
        setRecomendadorLoading(false);
      }
    };

    fetchRecomendaciones();

    return () => controller.abort();
  }, [items, isOpen]);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleWhatsAppCheckout = () => {
    const productList = items.map((item, index) =>
      `${index + 1}. ${item.producto.modelo} - ${item.cantidad} ${item.producto.unidad}${item.cantidad > 1 ? 's' : ''}`
    ).join('\n');

    const finalMessage =
      `Hola! Quiero cotizar la siguiente compra:\n\n` +
      productList +
      `\n\nEntiendo que el precio final depende de la cantidad, descuentos por volumen y recomendaciones técnicas del equipo.\n\n` +
      `¿Podrían confirmarme disponibilidad y enviarme una cotización personalizada?\n\nGracias!`;

    const whatsappUrl = `https://wa.me/5363962417?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {/* Botón flotante del carrito */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[60] w-[52px] h-[52px] md:w-[60px] md:h-[60px] bg-secondary-gradient text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Abrir carrito de compras"
      >
        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
        {totalItems > 0 && (
          <Badge className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 text-white border-2 border-white min-w-[22px] h-[22px] md:min-w-[26px] md:h-[26px] rounded-full flex items-center justify-center px-1 md:px-1.5 text-[10px] md:text-xs font-bold shadow-lg animate-pulse">
            {totalItems}
          </Badge>
        )}
      </button>

      {/* Overlay + Drawer */}
      {isOpen && (
        <>
          {/* Backdrop oscuro */}
          <div
            className="fixed inset-0 bg-black/50 z-[70] transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer lateral derecho */}
          <div className="fixed inset-y-0 right-0 z-[80] w-full sm:w-[480px] md:w-[520px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-slate-900">
                  Carrito
                  {totalItems > 0 && (
                    <span className="text-sm font-normal text-slate-500 ml-2">
                      ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* Estado vacío */
                <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-5">
                    <Package className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="text-slate-800 text-lg font-semibold mb-1">Tu carrito está vacío</p>
                  <p className="text-slate-500 text-sm mb-6">Explora nuestro catálogo y agrega productos</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="bg-secondary-gradient text-white"
                  >
                    Ver productos
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de items */}
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div
                        key={item.producto.id}
                        className="flex gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Imagen */}
                        <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                          {item.producto.foto ? (
                            <Image
                              src={item.producto.foto}
                              alt={item.producto.modelo}
                              fill
                              className="object-contain p-2"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">
                                {item.producto.categoria}
                              </p>
                              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                                {item.producto.modelo}
                              </h3>
                            </div>
                            <button
                              onClick={() => removeItem(item.producto.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-end justify-between mt-2.5 gap-2">
                            {/* Controles de cantidad */}
                            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center text-sm font-semibold text-slate-900 border-x border-slate-300 bg-white">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Precio */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-slate-900">
                                ${(item.producto.precio * item.cantidad).toLocaleString()}
                              </p>
                              {item.cantidad > 1 && (
                                <p className="text-[11px] text-slate-500">
                                  ${item.producto.precio.toLocaleString()} / {item.producto.unidad}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nota de precios */}
                  <div className="mx-4 md:mx-6 my-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Los precios mostrados son referenciales. El precio final se ajusta según cantidad, descuentos por volumen y configuración técnica.
                    </p>
                  </div>

                  {/* Sección de recomendados */}
                  <div className="px-4 md:px-6 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        Recomendados y comprados juntos
                      </h3>
                    </div>

                    {recomendadorLoading ? (
                      <div className="flex items-center gap-2 text-slate-500 text-xs py-3">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Buscando recomendaciones...
                      </div>
                    ) : recomendados.length > 0 ? (
                      <div
                        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
                        style={{ scrollbarWidth: 'none' }}
                      >
                        {recomendados.map((producto) => (
                          <div
                            key={producto.id}
                            className="min-w-[180px] max-w-[180px] rounded-lg border border-slate-200 bg-white p-2.5 flex-shrink-0 hover:shadow-md transition-shadow"
                          >
                            <div className="relative w-full h-28 rounded-md overflow-hidden bg-slate-50 border border-slate-100 mb-2">
                              {producto.foto ? (
                                <Image
                                  src={producto.foto}
                                  alt={producto.modelo}
                                  fill
                                  className="object-contain p-1.5"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <p className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug min-h-[2rem]">
                              {producto.modelo}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {producto.categoria}
                            </p>
                            {producto.potenciaKW != null && (
                              <p className="text-[10px] text-primary font-medium mt-0.5">
                                {producto.potenciaKW} kW
                              </p>
                            )}

                            <div className="mt-2">
                              {producto.vendible ? (
                                <Button asChild size="sm" className="w-full h-7 text-[11px] bg-secondary-gradient text-white">
                                  <Link href="/productos">Ver producto</Link>
                                </Button>
                              ) : (
                                <div className="w-full h-7 rounded-md border border-amber-200 bg-amber-50 text-[10px] text-amber-800 flex items-center justify-center px-1 text-center leading-tight">
                                  No se vende por separado
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-2">
                        Aún no hay sugerencias para esta combinación.
                      </p>
                    )}
                  </div>

                  {/* Sección de oferta de instalación */}
                  <div className="px-4 md:px-6 py-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold text-slate-800">
                        Oferta de instalación
                      </h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-3">
                      Incluye todos los materiales necesarios para el sistema completo.
                    </p>

                    {precioOferta != null ? (
                      <div className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-lg p-3">
                        <div>
                          <p className="text-xs text-slate-600">Desde</p>
                          <p className="text-lg font-bold text-primary">
                            ${precioOferta.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (ofertaId) window.location.href = `/ofertas/${ofertaId}`;
                          }}
                          disabled={!ofertaId}
                          size="sm"
                          className="bg-secondary-gradient text-white text-xs"
                        >
                          Ver oferta
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No encontramos una oferta para esta selección todavía.
                      </p>
                    )}
                  </div>

                  {/* Vaciar carrito */}
                  <div className="px-4 md:px-6 py-3 border-t border-slate-100">
                    <button
                      onClick={clearCart}
                      className="text-xs text-red-500 hover:text-red-600 hover:underline transition-colors"
                    >
                      Vaciar carrito
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer fijo con resumen y checkout */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 bg-white px-4 md:px-6 py-4 space-y-3">
                {/* Resumen */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Subtotal referencial</p>
                    <p className="text-xl font-bold text-slate-900">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-xs">
                    {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                  </Badge>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  <Button
                    onClick={handleWhatsAppCheckout}
                    className="w-full h-12 bg-secondary-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Solicitar cotización por WhatsApp
                  </Button>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block w-full">
                          <Button
                            disabled
                            variant="outline"
                            className="w-full h-10 border-slate-300 text-slate-400 cursor-not-allowed text-sm"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Pago en línea — Próximamente
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        El pago en línea estará disponible pronto
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
