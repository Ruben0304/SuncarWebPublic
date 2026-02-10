// Tipos para la tienda de productos fotovoltaicos

export type UnidadTipo = "pieza" | "set" | "m";

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
  marca_id?: string | null;
  marca_nombre?: string | null;
  potenciaKW?: number | null;
}

export interface ArticulosTiendaResponse {
  success: boolean;
  message: string;
  data: ArticuloTienda[];
}

// Tipos para las respuestas raw del backend de productos

export interface BackendMarca {
  _id: string;
  nombre: string;
}

export interface BackendMaterial {
  codigo: string;
  descripcion?: string;
  um?: string;
  precio: number;
  nombre?: string;
  marca_id?: string;
  foto?: string | null;
  potenciaKW?: number;
  habilitar_venta_web?: boolean;
  precio_por_cantidad?: PrecioPorCantidad;
  especificaciones?: EspecificacionesTecnicas;
}

export interface BackendCategoria {
  id: string;
  categoria: string;
  materiales: BackendMaterial[];
}

export interface BackendProductosResponse {
  success: boolean;
  data: BackendCategoria[];
}

export interface BackendMarcasResponse {
  success: boolean;
  data: BackendMarca[];
}
