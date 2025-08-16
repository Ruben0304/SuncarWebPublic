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

    // Formatear electrodomésticos de forma simple
    const electrodomesticosTexto = electrodomesticos
      .map(electro => 
        `${electro.nombre} (${electro.cantidad} unidad${electro.cantidad > 1 ? 'es' : ''}): ${electro.potencia}W, ${electro.horasUso}h diarias, consumo ${electro.consumoDiario.toFixed(2)}kWh por día`
      )
      .join('\n');

    // Crear texto profesional y legible
    const textoCompleto = `🌞 SOLICITUD DE COTIZACIÓN SOLAR - SUNCAR

📅 Fecha de solicitud: ${new Date(fechaSolicitud).toLocaleDateString('es-CU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

👤 Datos del cliente:
Nombre: ${nombre}
Teléfono: ${telefono}
Email: ${email}
Dirección: ${direccion}
Municipio: ${municipio}
Provincia: ${provincia}

🏠 Tipo de instalación: ${tipoInstalacion.charAt(0).toUpperCase() + tipoInstalacion.slice(1)}

⚡ Información energética:
Consumo mensual actual: ${consumoMensual} kWh
Consumo diario estimado: ${consumoTotalDiario.toFixed(2)} kWh
Potencia requerida del sistema: ${potenciaRequerida.toFixed(2)} kW

🔌 Electrodomésticos principales:
${electrodomesticosTexto}

📊 Resumen técnico:
Total de equipos: ${electrodomesticos.length} tipos diferentes
Consumo diario total: ${consumoTotalDiario.toFixed(2)} kWh
Potencia requerida: ${potenciaRequerida.toFixed(2)} kW
Paneles estimados: ${Math.ceil(potenciaRequerida / 0.4)} paneles de 400W aproximadamente

${comentarios ? `💬 Comentarios adicionales del cliente:
${comentarios}

` : ''}🚀 Próximos pasos:
1. Revisión técnica de los requerimientos
2. Evaluación del sitio de instalación
3. Cálculo detallado del sistema solar personalizado
4. Elaboración de propuesta económica
5. Contacto directo para coordinación de la instalación

📞 Esta cotización será procesada por nuestro equipo técnico especializado en sistemas solares. Nos pondremos en contacto contigo a la brevedad para brindarte una propuesta personalizada.

SUNCAR - Energía Solar para Cuba 🇨🇺
Soluciones energéticas sostenibles y eficientes
www.suncar.cu

Solicitud generada automáticamente desde nuestro sistema web.`;

    return textoCompleto;
  }
}