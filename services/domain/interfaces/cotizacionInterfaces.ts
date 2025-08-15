export interface CotizacionData {
  // Información personal
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  municipio: string;
  provincia: string;

  // Información del sistema
  consumoMensual: number;
  tipoInstalacion: 'residencial' | 'comercial' | 'industrial';
  
  // Electrodomésticos seleccionados
  electrodomesticos: {
    nombre: string;
    cantidad: number;
    potencia: number;
    horasUso: number;
    consumoDiario: number;
  }[];

  // Totales calculados
  consumoTotalDiario: number;
  potenciaRequerida: number;
  
  // Información adicional
  comentarios?: string;
  fechaSolicitud: string;
}

export interface CotizacionResponse {
  success: boolean;
  message: string;
  id?: string;
}