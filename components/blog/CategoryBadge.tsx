import React from "react"

export type Categoria = "instalacion" | "mantenimiento" | "casos_exito" | "ahorro_energetico" | "novedades" | "normativas"

export const CATEGORIAS_INFO: Record<Categoria, { label: string; color: string; icon: string }> = {
  instalacion: { label: "Instalación", color: "from-[#012928] to-[#023d3a]", icon: "⚡" },
  mantenimiento: { label: "Mantenimiento", color: "from-[#F2C300] to-[#AFEB17]", icon: "🔧" },
  casos_exito: { label: "Casos de Éxito", color: "from-[#012928] to-[#023d3a]", icon: "⭐" },
  ahorro_energetico: { label: "Ahorro Energético", color: "from-[#F2C300] to-[#AFEB17]", icon: "💰" },
  novedades: { label: "Novedades", color: "from-[#012928] to-[#023d3a]", icon: "🆕" },
  normativas: { label: "Normativas", color: "from-[#F2C300] to-[#AFEB17]", icon: "📋" },
}

interface CategoryBadgeProps {
  categoria: Categoria
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function CategoryBadge({ categoria, size = "md", className = "" }: CategoryBadgeProps) {
  const info = CATEGORIAS_INFO[categoria]

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1 text-xs gap-1",
    lg: "px-4 py-2 text-sm gap-2",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-gradient-to-r ${info.color} text-white font-semibold shadow-lg ${sizeClasses[size]} ${className}`}
    >
      <span>{info.icon}</span>
      {info.label}
    </span>
  )
}
