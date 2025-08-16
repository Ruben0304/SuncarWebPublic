import { CotizacionData } from '../../domain/interfaces/cotizacionInterfaces';

export class CotizacionFormatter {
  static formatCotizacionText(data: CotizacionData): string {
    const {
      nombre,
      telefono,
      email,
      direccion,
      municipio,
      provincia,
      consumoMensual,
      tipoInstalacion,
      electrodomesticos,
      consumoTotalDiario,
      potenciaRequerida,
      comentarios,
      fechaSolicitud
    } = data;

    // Formatear electrodomésticos seleccionados
    const electrodomesticosTexto = electrodomesticos.length > 0 
      ? electrodomesticos
          .map(electro => `${electro.nombre} (${electro.cantidad} unidad${electro.cantidad > 1 ? 'es' : ''})`)
          .join('\n')
      : 'No seleccionó electrodomésticos específicos';

    // Texto administrativo limpio para procesamiento interno
    const textoCompleto = `☀️ SOLICITUD DE COTIZACIÓN

📅 Fecha de solicitud: ${new Date(fechaSolicitud).toLocaleDateString('es-CU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

👤 DATOS DEL CLIENTE:
Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}
Dirección: ${direccion}
Municipio: ${municipio}
Provincia: ${provincia}

🏠 INFORMACIÓN DE LA PROPIEDAD:
Tipo de instalación: ${tipoInstalacion.charAt(0).toUpperCase() + tipoInstalacion.slice(1)}

⚡ INFORMACIÓN ENERGÉTICA:
Factura mensual declarada: $${consumoMensual/30} USD (estimado)

🔌 ELECTRODOMÉSTICOS SELECCIONADOS:
${electrodomesticosTexto}

${comentarios ? `💬 COMENTARIOS ADICIONALES:
${comentarios}` : '📝 Sin comentarios adicionales'}`;

    return textoCompleto;
  }
}