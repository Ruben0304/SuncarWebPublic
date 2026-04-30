"use client";

import { Mail, Phone, MapPin } from "lucide-react";
import { useContactos } from "../hooks/useContactos";

interface ContactInfoProps {
  className?: string;
}

export default function ContactInfo({ className = "" }: ContactInfoProps) {
  const { contactos, loading, error } = useContactos();

  const contacto = contactos[0];

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h3 className="text-lg font-semibold">Contacto</h3>
        <div className="space-y-3 text-blue-100">
          <div className="flex items-center space-x-3">
            <Phone size={18} className="text-secondary-start" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-32"></div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail size={18} className="text-secondary-start" />
            <div className="h-4 bg-white/20 rounded animate-pulse w-48"></div>
          </div>
          <div className="flex items-start space-x-3">
            <MapPin size={18} className="text-secondary-start mt-1" />
            <div className="space-y-1">
              <div className="h-4 bg-white/20 rounded animate-pulse w-40"></div>
              <div className="h-4 bg-white/20 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !contacto) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">Contacto</h3>
      <div className="space-y-3 text-blue-100">
        <div className="flex items-center space-x-3">
          <Phone size={18} className="text-secondary-start" />
          <span>{contacto.telefono}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Mail size={18} className="text-secondary-start" />
          <span>{contacto.correo}</span>
        </div>
        <div className="flex items-start space-x-3">
          <MapPin size={18} className="text-secondary-start mt-1" />
          <span className="whitespace-pre-line">{contacto.direccion}</span>
        </div>
      </div>
    </div>
  );
}
