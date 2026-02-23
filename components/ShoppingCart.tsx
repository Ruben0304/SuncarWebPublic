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

            {/* Header - compacto en móvil */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-slate-900 leading-tight">Mi Carrito</h2>
                  {totalItems > 0 && (
                    <p className="text-[11px] text-slate-400">
                      {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 flex items-center justify-center hover:bg-slate-100 active:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                /* Estado vacío */
                <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-800 text-base font-semibold mb-1">Tu carrito está vacío</p>
                  <p className="text-slate-400 text-[13px] mb-5 max-w-[220px]">Agrega productos del catálogo para comenzar</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="bg-secondary-gradient text-white h-11 px-6 rounded-xl text-[13px] font-semibold active:scale-[0.98] transition-all"
                  >
                    Explorar productos
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de items */}
                  <div className="divide-y divide-slate-100">
                    {items.map((item, index) => (
                      <div
                        key={item.producto.id}
                        className="flex gap-3 px-4 py-3.5 active:bg-slate-50 transition-colors"
                      >
                        {/* Imagen - tamaño touch-friendly */}
                        <div className="relative w-[72px] h-[72px] bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-200">
                          {item.producto.foto ? (
                            <Image
                              src={item.producto.foto}
                              alt={item.producto.modelo}
                              fill
                              sizes="72px"
                              className="object-contain p-1.5"
                              priority={index < 3}
                              loading={index < 3 ? 'eager' : 'lazy'}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-7 h-7" />
                            </div>
                          )}
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-[13px] font-semibold text-slate-900 line-clamp-2 leading-tight">
                                {item.producto.modelo}
                              </h3>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {item.producto.categoria}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.producto.id)}
                              className="p-1.5 -mr-1.5 -mt-0.5 text-slate-300 hover:text-red-500 active:text-red-600 active:bg-red-50 rounded-full transition-colors flex-shrink-0"
                              title="Eliminar"
                            >
                              <Trash2 className="w-[15px] h-[15px]" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2 gap-2">
                            {/* Controles de cantidad - touch targets 44px */}
                            <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-white">
                              <button
                                onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                                className="w-9 h-9 flex items-center justify-center text-slate-500 active:bg-slate-100 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-[13px] font-bold text-slate-900 tabular-nums">
                                {item.cantidad}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                                className="w-9 h-9 flex items-center justify-center text-slate-500 active:bg-slate-100 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Precio */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-[15px] font-bold text-slate-900 tabular-nums">
                                ${(item.producto.precio * item.cantidad).toLocaleString()}
                              </p>
                              {item.cantidad > 1 && (
                                <p className="text-[10px] text-slate-400 tabular-nums">
                                  ${item.producto.precio.toLocaleString()}/{item.producto.unidad}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Nota de precios */}
                  <div className="mx-4 my-2.5 px-3 py-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl">
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Precios referenciales. El valor final varía según cantidad, volumen y configuración técnica.
                    </p>
                  </div>

                  {/* Sección de recomendados */}
                  <div className="px-4 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <h3 className="text-[13px] font-semibold text-slate-800">
                        Comprados juntos
                      </h3>
                    </div>

                    {recomendadorLoading ? (
                      <div className="flex items-center gap-2 text-slate-500 text-xs py-3">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Buscando recomendaciones...
                      </div>
                    ) : recomendados.length > 0 ? (
                      <div
                        className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                      >
                        {recomendados.map((producto, recIndex) => (
                          <div
                            key={producto.id}
                            className="min-w-[150px] max-w-[150px] rounded-xl border border-slate-200 bg-white p-2 flex-shrink-0 snap-start active:scale-[0.98] transition-transform"
                          >
                            <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 mb-1.5">
                              {producto.foto ? (
                                <Image
                                  src={producto.foto}
                                  alt={producto.modelo}
                                  fill
                                  sizes="150px"
                                  className="object-contain p-1.5"
                                  loading={recIndex < 2 ? 'eager' : 'lazy'}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] font-medium text-slate-800 line-clamp-2 leading-tight min-h-[1.75rem]">
                              {producto.modelo}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {producto.categoria}
                            </p>
                            {producto.potenciaKW != null && (
                              <p className="text-[10px] text-primary font-semibold mt-0.5">
                                {producto.potenciaKW} kW
                              </p>
                            )}

                            <div className="mt-1.5">
                              {producto.vendible ? (
                                <Button asChild size="sm" className="w-full h-7 text-[10px] bg-secondary-gradient text-white rounded-lg">
                                  <Link href="/productos">Ver producto</Link>
                                </Button>
                              ) : (
                                <div className="w-full h-7 rounded-lg border border-amber-200 bg-amber-50 text-[9px] text-amber-700 flex items-center justify-center px-1 text-center leading-tight font-medium">
                                  No se vende suelto
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
                  <div className="px-4 py-3 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                        <Wrench className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <h3 className="text-[13px] font-semibold text-slate-800">
                        Oferta de instalación
                      </h3>
                    </div>

                    {precioOferta != null ? (
                      <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-xl p-3">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Desde</p>
                          <p className="text-base font-bold text-primary tabular-nums">
                            ${precioOferta.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => {
                            if (ofertaId) window.location.href = `/ofertas/${ofertaId}`;
                          }}
                          disabled={!ofertaId}
                          size="sm"
                          className="bg-secondary-gradient text-white text-[11px] h-8 rounded-lg active:scale-[0.97]"
                        >
                          Ver oferta
                          <ChevronRight className="w-3 h-3 ml-0.5" />
                        </Button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 py-1">
                        Sin oferta disponible para esta selección.
                      </p>
                    )}
                  </div>

                  {/* Vaciar carrito */}
                  <div className="px-4 py-3 border-t border-slate-100">
                    <button
                      onClick={clearCart}
                      className="text-[11px] text-slate-400 active:text-red-500 transition-colors"
                    >
                      Vaciar carrito
                    </button>
                  </div>

                  {/* Spacer para que el contenido no quede oculto por el footer */}
                  <div className="h-2" />
                </>
              )}
            </div>

            {/* Footer fijo con resumen y checkout - safe area para iOS */}
            {items.length > 0 && (
              <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] space-y-2.5">
                {/* Resumen en línea */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="text-[11px] text-slate-400 uppercase tracking-wide">Subtotal ref.</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums">
                      ${totalPrice.toLocaleString()}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
                  </span>
                </div>

                {/* CTA principal - altura 48px para mobile touch */}
                <Button
                  onClick={handleWhatsAppCheckout}
                  className="w-full h-12 bg-secondary-gradient text-white font-semibold shadow-lg active:scale-[0.98] transition-all text-[13px] rounded-xl"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar cotización por WhatsApp
                </Button>

                {/* Pago online - secundario y compacto */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full">
                        <Button
                          disabled
                          variant="ghost"
                          className="w-full h-9 text-slate-400 cursor-not-allowed text-xs"
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1.5" />
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
            )}
          </div>
        </>
      )}
    </>
  );
}
