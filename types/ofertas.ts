export interface OfertaSimplificada {
  id?: string | null;
  descripcion: string;
  descripcion_detallada?: string | null;
  marca?: string | null;
  precio: number;
  precio_cliente?: number | null;
  imagen?: string | null;
  moneda: string;
  financiamiento: boolean;
  descuentos?: string | null;
  pdf?: string | null;
  is_active?: boolean;
}

export interface OfertaElemento {
  categoria?: string | null;
  foto?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
}

export interface Oferta {
  id?: string | null;
  descripcion: string;
  descripcion_detallada?: string | null;
  marca?: string | null;
  precio: number;
  precio_cliente?: number | null;
  imagen?: string | null;
  moneda: string;
  financiamiento: boolean;
  descuentos?: string | null;
  pdf?: string | null;
  garantias: string[];
  elementos: OfertaElemento[];
  is_active?: boolean;
}

export interface OfertasResponse {
  success: boolean;
  message: string;
  data: OfertaSimplificada[];
}

export interface OfertaResponse {
  success: boolean;
  message: string;
  data: Oferta | null;
}

export interface RecomendadorRequest {
  texto: string;
}

export interface RecomendadorData {
  texto: string;
  ofertas: OfertaSimplificada[];
}

export interface RecomendadorResponse {
  success: boolean;
  message: string;
  data?: RecomendadorData;
}
