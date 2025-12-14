'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MessageCircle,
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

export default function ShoppingCartComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, updateQuantity, removeItem, getTotalItems, getTotalPrice, clearCart } = useCart();

  // Actualizar el estado global cuando cambie
  useEffect(() => {
    cartOpenState = isOpen;
  }, [isOpen]);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleWhatsAppCheckout = () => {
    const productList = items.map((item, index) =>
      `${index + 1}. ${item.producto.modelo} - ${item.cantidad} ${item.producto.unidad}${item.cantidad > 1 ? 's' : ''} x $${item.producto.precio.toLocaleString()} = $${(item.producto.precio * item.cantidad).toLocaleString()}`
    ).join('\n');

    const finalMessage =
      `Hola! Quiero realizar la siguiente compra:\n\n` +
      productList +
      `\n\nTOTAL: $${totalPrice.toLocaleString()}\n\n` +
      `Podrian confirmar disponibilidad y coordinar la entrega?\n\nGracias!`;

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

      {/* Panel del carrito a pantalla completa */}
      {isOpen && (
        <>
          {/* Panel del carrito */}
          <div className="fixed inset-0 bg-white z-50 flex flex-col animate-in fade-in duration-200">
            {/* Header con navegación */}
            <div className="bg-gradient-to-r from-primary to-primary/90 text-white px-3 md:px-4 py-3 md:py-4 flex items-center gap-3 md:gap-4 shadow-lg">
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full h-9 w-9 md:h-10 md:w-10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold">Mi Carrito</h2>
                <p className="text-xs md:text-sm text-white/90">{totalItems} {totalItems === 1 ? 'producto' : 'productos'}</p>
              </div>
              <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
            </div>

            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-slate-50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-200 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 text-slate-400" />
                  </div>
                  <p className="text-slate-700 text-xl md:text-2xl font-bold mb-2">Tu carrito está vacío</p>
                  <p className="text-slate-500 text-sm md:text-base">Agrega productos desde la tienda</p>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="mt-4 md:mt-6 bg-secondary-gradient text-white"
                    size="lg"
                  >
                    Ir a la tienda
                  </Button>
                </div>
              ) : (
                <>
                  <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {items.map((item) => (
                      <div
                        key={item.producto.id}
                        className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm hover:shadow-lg transition-all"
                      >
                        <div className="flex gap-2 md:gap-3">
                          {/* Imagen */}
                          <div className="relative w-20 h-20 md:w-24 md:h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                            {item.producto.foto ? (
                              <Image
                                src={item.producto.foto}
                                alt={item.producto.modelo}
                                fill
                                className="object-contain p-1.5 md:p-2"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ShoppingCart className="w-6 h-6 md:w-8 md:h-8" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 flex flex-col">
                            <Badge className="text-[9px] md:text-[10px] mb-1 bg-primary/10 text-primary border-primary/20 px-1.5 md:px-2 py-0.5 w-fit">
                              {item.producto.categoria}
                            </Badge>
                            <h3 className="font-semibold text-xs md:text-sm text-slate-900 line-clamp-2 mb-1">
                              {item.producto.modelo}
                            </h3>
                            <p className="text-primary font-bold text-sm md:text-base mb-1.5 md:mb-2">
                              ${item.producto.precio.toLocaleString()}
                              <span className="text-slate-500 text-[10px] md:text-xs font-normal ml-1">/ {item.producto.unidad}</span>
                            </p>

                            <div className="mt-auto space-y-1.5 md:space-y-2">
                              {/* Controles de cantidad */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-0.5 md:gap-1 bg-slate-50 rounded-lg border border-slate-300">
                                  <Button
                                    onClick={() => updateQuantity(item.producto.id, item.cantidad - 1)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 md:h-8 md:w-8 hover:bg-slate-200 rounded-lg"
                                  >
                                    <Minus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                  </Button>
                                  <span className="w-8 md:w-10 text-center font-bold text-xs md:text-sm">{item.cantidad}</span>
                                  <Button
                                    onClick={() => updateQuantity(item.producto.id, item.cantidad + 1)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 md:h-8 md:w-8 hover:bg-slate-200 rounded-lg"
                                  >
                                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                  </Button>
                                </div>

                                <Button
                                  onClick={() => removeItem(item.producto.id)}
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 md:h-8 md:w-8 text-red-500 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </Button>
                              </div>

                              {/* Subtotal */}
                              <div className="bg-slate-50 rounded-lg px-2 md:px-3 py-1.5 md:py-2 border border-slate-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] md:text-xs text-slate-600">Subtotal:</span>
                                  <span className="font-bold text-slate-900 text-xs md:text-sm">
                                    ${(item.producto.precio * item.cantidad).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totales y acciones */}
                  <div className="max-w-5xl mx-auto mt-4 md:mt-8 space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 items-start">
                      <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 shadow-sm space-y-3 md:space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs md:text-sm text-slate-600">Cant. de productos</div>
                          <div className="text-xl md:text-2xl font-bold text-slate-900">{totalItems}</div>
                        </div>
                        <div className="h-px bg-slate-200" />
                        <div className="flex items-center justify-between">
                          <div className="text-base md:text-lg font-semibold text-slate-800">Total</div>
                          <div className="text-2xl md:text-3xl font-black text-primary">
                            ${totalPrice.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 md:gap-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block w-full">
                                <Button
                                  disabled
                                  className="w-full h-10 md:h-12 border border-dashed border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed font-semibold text-xs md:text-base"
                                >
                                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                                  Pago en línea
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Próximamente
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <Button
                          onClick={handleWhatsAppCheckout}
                          className="w-full h-10 md:h-12 bg-secondary-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm md:text-base"
                        >
                          <MessageCircle className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                          Comprar por WhatsApp
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full h-9 md:h-11 text-red-500 hover:bg-red-50 border-red-200 text-xs md:text-base"
                    >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      Vaciar carrito
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
