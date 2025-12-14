"use client";
import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { getCartOpenState } from "@/components/ShoppingCart";

const UnifiedChatAssistant: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();

  // WhatsApp config
  const phoneNumber = "5363962417";
  const defaultWhatsAppMessage = "¡Hola! Me interesa conocer más sobre sus servicios de energía solar. ¿Podrían brindarme información?";

  // Verificar si el carrito está abierto cada 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      setIsCartOpen(getCartOpenState());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const openWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultWhatsAppMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Ocultar en la página de tienda, productos o cuando el carrito está abierto
  const shouldHide = pathname === '/productos' || isCartOpen;

  if (shouldHide) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-4 sm:right-4 z-50">
      {/* Botón flotante de WhatsApp */}
      <button
        onClick={openWhatsApp}
        className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] text-white rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-105 ring-2 ring-[#25D366]/40 hover:ring-[#25D366]/60"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
    </div>
  );
};

export default UnifiedChatAssistant;
