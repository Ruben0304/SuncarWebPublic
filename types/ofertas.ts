/** Lo que cambia de un kit a otro y se puede elegir en "Armar mi kit". */
export interface ConfigKit {
  /** Suma de los inversores del kit, en kW. */
  inversorKw: number;
  inversorUnidades: number;
  /** Suma de las baterías del kit, en kWh. 0 si no trae. */
  bateriaKwh: number;
  bateriaUnidades: number;
  paneles: number;
  /** Potencia de cada panel, si el kit la dice. */
  panelW: number | null;
  /** Metros cuadrados que ocupa cada panel, si el kit trae sus medidas. */
  panelM2: number | null;
  /** material_codigo del inversor y de la batería, para sus fotos. */
  inversorCodigo: string | null;
  bateriaCodigo: string | null;
}

export interface OfertaSimplificada {
  id?: string | null;
  /** id de Mongo: el recomendador de IA responde con este, no con el número de oferta. */
  idInterno?: string | null;
  descripcion: string;
  descripcion_detallada?: string | null;
  marca?: string | null;
  potenciaInversor?: string | null;
  precio: number;
  precio_cliente?: number | null;
  imagen?: string | null;
  moneda: string;
  financiamiento: boolean;
  descuentos?: string | null;
  pdf?: string | null;
  is_active?: boolean;
  /** Categorías de sus materiales, sin tildes y en mayúsculas (PANELES, BATERIAS…). */
  categorias?: string[] | null;
  /** Códigos de material que lleva el kit: de aquí sale "Se suele comprar junto con". */
  codigos?: string[] | null;
  /** null si el kit no trae inversor con potencia: no entra en "Armar mi kit". */
  config?: ConfigKit | null;
  /** 110 o 220 V. Los kits publicados antes de que existiera el campo no lo traen. */
  voltaje?: number | null;
}

export interface OfertaElemento {
  categoria?: string | null;
  foto?: string | null;
  descripcion?: string | null;
  cantidad?: number | null;
}

/** Un componente del kit tal como se dibuja en "Ver cómo quedaría". */
export interface PiezaInstalacion {
  /** material_codigo del inventario. */
  codigo: string | null;
  nombre: string;
  cantidad: number;
  foto: string | null;
  /** kW del inversor, kWh de la batería o W del panel, si el nombre lo dice. */
  potencia: number | null;
}

/** Los componentes del kit agrupados por su papel en la instalación. */
export interface InstalacionKit {
  paneles: PiezaInstalacion[];
  inversores: PiezaInstalacion[];
  baterias: PiezaInstalacion[];
  /** Fusibles y portafusibles de corriente continua, entre paneles e inversor. */
  proteccionDc: PiezaInstalacion[];
  /** Gabinete, breakers y transferencial, entre el inversor y la casa. */
  tablero: PiezaInstalacion[];
  estructuras: PiezaInstalacion[];
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
  terminos_condiciones_texto?: string | null;
  /** 110 o 220 V; null en los kits de antes del campo. */
  voltaje?: number | null;
  garantias: string[];
  elementos: OfertaElemento[];
  is_active?: boolean;
  /** null si el kit no trae inversor: sin él no hay instalación que dibujar. */
  instalacion?: InstalacionKit | null;
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
