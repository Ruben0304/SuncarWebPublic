// Tipos para la tienda de productos fotovoltaicos

export type UnidadTipo = "pieza" | "set";

export interface EspecificacionesTecnicas {
  capacidad?: string;
  voltaje?: string;
  ac_voltaje?: string;
  dc_voltaje_entrada?: string;
  peso_neto?: string;
  peso_bruto?: string;
  tamano_embalaje?: string;
  energia?: string;
  max_piezas_paralelo?: number;
  ciclos_vida?: number;
  tamano_producto?: string;
  garantia?: string;
  comunicacion?: string;
  minima_cantidad_apilada?: number;
  energia_modulo?: string;
  con_bateria?: boolean;
  voltaje_puesta_marcha?: string;
  maxima_carga_actual?: string;
  voltaje_maximo_entrada_solar?: string;
  numero_maximo_rutas_entrada?: number;
  voltaje_nominal_rama?: string;
  corriente_nominal_rama?: string;
  // Permite agregar atributos adicionales de manera flexible
  [key: string]: string | number | boolean | undefined;
}

export interface PrecioPorCantidad {
  [cantidad: string]: number;
}

export interface ArticuloTienda {
  id: string;
  categoria: string;
  modelo: string;
  descripcion_uso?: string | null;
  foto?: string | null;
  unidad: UnidadTipo;
  precio: number;
  precio_por_cantidad?: PrecioPorCantidad | null;
  especificaciones?: EspecificacionesTecnicas | null;
}

export interface ArticulosTiendaResponse {
  success: boolean;
  message: string;
  data: ArticuloTienda[];
}

export interface ArticuloTiendaResponse {
  success: boolean;
  message: string;
  data: ArticuloTienda | null;
}

export interface CreateArticuloRequest {
  categoria: string;
  modelo: string;
  unidad: UnidadTipo;
  precio: number;
  descripcion_uso?: string;
  foto?: File;
  precio_por_cantidad?: string; // JSON string
  especificaciones?: string; // JSON string
}

export interface UpdateArticuloRequest {
  categoria?: string;
  modelo?: string;
  descripcion_uso?: string;
  foto?: File;
  unidad?: UnidadTipo;
  precio?: number;
  precio_por_cantidad?: string; // JSON string
  especificaciones?: string; // JSON string
}
