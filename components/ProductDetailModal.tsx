"use client";

import { useState } from "react";
import { ArticuloTienda } from "@/types/tienda";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  X,
  Package,
  Zap,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

interface ProductDetailModalProps {
  producto: ArticuloTienda;
  onClose: () => void;
}

export default function ProductDetailModal({
  producto,
  onClose,
}: ProductDetailModalProps) {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState<string | null>(null);
  const { addItem, items, updateQuantity } = useCart();

  // Obtener cantidad del producto en el carrito
  const productInCart = items.find((item) => item.producto.id === producto.id);
  const quantityInCart = productInCart ? productInCart.cantidad : 0;

  // Obtener número de WhatsApp (usando número general temporalmente)
  const whatsappNumber = "5363962417";
  const cleanWhatsappNumber = whatsappNumber;

  // Parsear precio por cantidad
  const preciosPorCantidad = producto.precio_por_cantidad
    ? Object.entries(producto.precio_por_cantidad).sort(
        (a, b) => Number(a[0]) - Number(b[0]),
      )
    : [];

  // Especificaciones principales para mostrar primero (mínimo 2)
  const mainSpecsKeys = [
    "capacidad",
    "voltaje",
    "energia",
    "potencia",
    "peso_neto",
    "garantia",
    "con_bateria",
  ];

  const especificaciones = producto.especificaciones || {};
  const allSpecEntries = Object.entries(especificaciones);

  // Asegurar que se muestren al menos 2 especificaciones
  const mainSpecs = allSpecEntries.filter(([key]) =>
    mainSpecsKeys.includes(key),
  );
  const otherSpecs = allSpecEntries.filter(
    ([key]) => !mainSpecsKeys.includes(key),
  );

  // Si hay menos de 2 specs principales, tomar de las otras
  const visibleSpecs =
    mainSpecs.length >= 2 ? mainSpecs : allSpecEntries.slice(0, 2);
  const hiddenSpecs =
    mainSpecs.length >= 2 ? otherSpecs : allSpecEntries.slice(2);

  // Calcular precio basado en cantidad seleccionada
  const precioActual =
    selectedQuantity && producto.precio_por_cantidad
      ? producto.precio_por_cantidad[selectedQuantity]
      : producto.precio;

  const descuentoPorcentaje =
    selectedQuantity && producto.precio_por_cantidad
      ? Math.round(
          ((producto.precio - producto.precio_por_cantidad[selectedQuantity]) /
            producto.precio) *
            100,
        )
      : 0;

  // Formatear nombre de especificación
  const formatSpecName = (key: string): string => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Formatear valor de especificación
  const formatSpecValue = (value: any): string => {
    if (typeof value === "boolean") {
      return value ? "Sí" : "No";
    }
    return String(value);
  };

  // Manejar contacto por WhatsApp
  const handleWhatsAppContact = () => {
    const cantidadFinal = selectedQuantity
      ? parseInt(selectedQuantity)
      : quantityInCart || 1;
    const precioFinal =
      selectedQuantity && producto.precio_por_cantidad
        ? producto.precio_por_cantidad[selectedQuantity] * cantidadFinal
        : producto.precio * cantidadFinal;

    const descuentoTexto =
      selectedQuantity && descuentoPorcentaje > 0
        ? ` (${descuentoPorcentaje}% descuento)`
        : "";

    const finalMessage =
      `Hola! Estoy interesado en comprar:\n\n` +
      `${producto.modelo}\n` +
      `Cantidad: ${cantidadFinal} ${producto.unidad}${cantidadFinal > 1 ? "s" : ""}\n` +
      `Precio: $${producto.precio.toLocaleString()} x ${cantidadFinal} = $${precioFinal.toLocaleString()}${descuentoTexto}\n\n` +
      `Podrian confirmar disponibilidad y coordinar la entrega?\n\nGracias!`;

    const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleAddToCart = () => {
    const cantidad = selectedQuantity ? parseInt(selectedQuantity) : 1;
    addItem(producto, cantidad);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl md:rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-3 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-2xl md:rounded-t-3xl">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base md:text-xl font-bold text-gray-900">
                  Detalles del Producto
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5 md:mt-1">
                  <Badge className="bg-primary text-white text-[10px] md:text-xs px-2 py-0.5">
                    {producto.categoria}
                  </Badge>
                  {producto.marca_nombre && (
                    <Badge className="bg-blue-600 text-white text-[10px] md:text-xs px-2 py-0.5">
                      {producto.marca_nombre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 h-8 w-8 md:h-10 md:w-10"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-3 md:p-6 lg:p-8">
            <div className="grid md:grid-cols-2 gap-4 md:gap-8">
              {/* Imagen del producto */}
              <div className="space-y-3 md:space-y-4">
                <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl overflow-hidden border border-gray-200">
                  {producto.foto ? (
                    <Image
                      src={producto.foto}
                      alt={producto.modelo}
                      fill
                      className="object-contain p-4 md:p-8"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-16 h-16 md:w-24 md:h-24 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Características destacadas */}
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-2 md:p-4 text-center">
                      <Zap className="w-4 h-4 md:w-6 md:h-6 text-blue-600 mx-auto mb-1 md:mb-2" />
                      <p className="text-[10px] md:text-xs font-semibold text-blue-900">
                        Alta Eficiencia
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-2 md:p-4 text-center">
                      <Shield className="w-4 h-4 md:w-6 md:h-6 text-green-600 mx-auto mb-1 md:mb-2" />
                      <p className="text-[10px] md:text-xs font-semibold text-green-900">
                        Garantía
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-2 md:p-4 text-center">
                      <Package className="w-4 h-4 md:w-6 md:h-6 text-purple-600 mx-auto mb-1 md:mb-2" />
                      <p className="text-[10px] md:text-xs font-semibold text-purple-900">
                        Calidad
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Información del producto */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {producto.modelo}
                  </h3>
                  {producto.potenciaKW != null && (
                    <div className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold bg-primary/10 rounded-full px-3 py-1 mb-2">
                      <Zap className="w-4 h-4" />
                      {producto.potenciaKW} kW
                    </div>
                  )}
                  {producto.descripcion_uso && (
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      {producto.descripcion_uso}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl md:rounded-2xl p-4 md:p-6 border border-slate-200">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
                      ${precioActual.toLocaleString()}
                    </span>
                    <span className="text-sm md:text-base text-slate-600">
                      / {producto.unidad}
                    </span>
                  </div>

                  {selectedQuantity && descuentoPorcentaje > 0 && (
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <Badge className="bg-green-500 text-white text-[10px] md:text-xs">
                        <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                        {descuentoPorcentaje}% descuento
                      </Badge>
                      <span className="text-xs md:text-sm text-slate-500 line-through">
                        ${producto.precio.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Selector de cantidad si hay precios por volumen */}
                  {preciosPorCantidad.length > 0 && (
                    <div className="space-y-2 md:space-y-3">
                      <label className="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1.5 md:gap-2">
                        <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />
                        Descuentos por volumen:
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                        <Button
                          variant={
                            selectedQuantity === null ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedQuantity(null)}
                          className={`h-auto py-2 md:py-2.5 ${
                            selectedQuantity === null
                              ? "justify-between bg-primary text-white hover:bg-primary/90"
                              : "justify-between border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="font-medium text-[10px] md:text-sm">
                            1 {producto.unidad}
                          </span>
                          <span className="text-[9px] md:text-xs font-semibold">
                            ${producto.precio.toLocaleString()}
                          </span>
                        </Button>
                        {preciosPorCantidad.map(([cantidad, precio]) => (
                          <Button
                            key={cantidad}
                            variant={
                              selectedQuantity === cantidad
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setSelectedQuantity(cantidad)}
                            className={`h-auto py-2 md:py-2.5 ${
                              selectedQuantity === cantidad
                                ? "justify-between bg-primary text-white hover:bg-primary/90"
                                : "justify-between border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span className="font-medium text-[10px] md:text-sm">
                              {cantidad}+ {producto.unidad}s
                            </span>
                            <span className="text-[9px] md:text-xs font-semibold">
                              ${precio.toLocaleString()}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2 md:space-y-3">
                  {quantityInCart > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg md:rounded-xl p-3 md:p-4">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <span className="text-xs md:text-sm font-semibold text-primary">
                          En tu carrito:
                        </span>
                        <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg border-2 border-primary px-1.5 md:px-2 py-0.5 md:py-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              updateQuantity(producto.id, quantityInCart - 1)
                            }
                            className="h-7 w-7 md:h-8 md:w-8 hover:bg-primary/10 rounded-lg"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                          </Button>
                          <span className="w-8 md:w-12 text-center font-bold text-primary text-base md:text-lg">
                            {quantityInCart}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleAddToCart}
                            className="h-7 w-7 md:h-8 md:w-8 hover:bg-primary/10 rounded-lg"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4 text-primary" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-600">
                        Subtotal:{" "}
                        <span className="font-bold text-primary">
                          ${(producto.precio * quantityInCart).toLocaleString()}
                        </span>
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {quantityInCart === 0 && (
                      <Button
                        onClick={handleAddToCart}
                        variant="outline"
                        className="h-10 md:h-12 border-2 border-primary text-primary hover:bg-primary/5 font-semibold text-xs md:text-base"
                        size="lg"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                        Al Carrito
                      </Button>
                    )}
                    <Button
                      onClick={handleWhatsAppContact}
                      className={`h-10 md:h-12 bg-secondary-gradient text-white font-semibold shadow-lg hover:shadow-xl transition-all text-xs md:text-base ${quantityInCart > 0 ? "col-span-2" : ""}`}
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                      Comprar ya
                    </Button>
                  </div>
                </div>

                {/* Especificaciones técnicas */}
                {allSpecEntries.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 md:pt-6">
                    <h4 className="text-base md:text-lg font-bold text-slate-900 mb-3 md:mb-4 flex items-center gap-1.5 md:gap-2">
                      <Info className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      Especificaciones Técnicas
                    </h4>

                    <div className="space-y-1.5 md:space-y-2">
                      {/* Especificaciones visibles (mínimo 2) */}
                      {visibleSpecs.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between items-center py-2 md:py-2.5 border-b border-slate-100"
                        >
                          <span className="text-xs md:text-sm font-medium text-slate-700">
                            {formatSpecName(key)}
                          </span>
                          <span className="text-xs md:text-sm text-slate-900 font-semibold">
                            {formatSpecValue(value)}
                          </span>
                        </div>
                      ))}

                      {/* Especificaciones adicionales (colapsables) */}
                      {hiddenSpecs.length > 0 && (
                        <>
                          {showAllSpecs &&
                            hiddenSpecs.map(([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between items-center py-2 md:py-2.5 border-b border-slate-100"
                              >
                                <span className="text-xs md:text-sm font-medium text-slate-700">
                                  {formatSpecName(key)}
                                </span>
                                <span className="text-xs md:text-sm text-slate-900 font-semibold">
                                  {formatSpecValue(value)}
                                </span>
                              </div>
                            ))}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllSpecs(!showAllSpecs)}
                            className="w-full mt-2 md:mt-3 text-primary hover:bg-primary/5 h-9 md:h-10 text-xs md:text-sm"
                          >
                            {showAllSpecs ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                Ver menos especificaciones
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                Ver más especificaciones ({hiddenSpecs.length}{" "}
                                adicionales)
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
