export interface OfertaSimplificada {
  id?: string | null;
  descripcion: string;
  precio: number;
  precio_cliente?: number | null;
  imagen?: string | null;
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
  precio: number;
  precio_cliente?: number | null;
  imagen?: string | null;
  garantias: string[];
  elementos: OfertaElemento[];
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