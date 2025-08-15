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

    // Formatear electrodomésticos
    const electrodomesticosTexto = electrodomesticos
      .map(electro => 
        `• ${electro.nombre} (${electro.cantidad} unidad${electro.cantidad > 1 ? 'es' : ''}): ${electro.potencia}W, ${electro.horasUso}h/día, ${electro.consumoDiario.toFixed(2)}kWh/día`
      )
      .join('\n');

    // Crear texto formateado para email
    const textoCompleto = `
═══════════════════════════════════════════════════════════════
                    SOLICITUD DE COTIZACIÓN SOLAR
═══════════════════════════════════════════════════════════════

📅 FECHA DE SOLICITUD: ${new Date(fechaSolicitud).toLocaleDateString('es-CU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}

👤 INFORMACIÓN DEL CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nombre completo: ${nombre}
Teléfono: ${telefono}
Correo electrónico: ${email}
Dirección: ${direccion}
Municipio: ${municipio}
Provincia: ${provincia}

🏢 TIPO DE INSTALACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Categoría: ${tipoInstalacion.charAt(0).toUpperCase() + tipoInstalacion.slice(1)}

⚡ INFORMACIÓN DE CONSUMO ENERGÉTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Consumo mensual actual: ${consumoMensual} kWh
Consumo diario estimado: ${consumoTotalDiario.toFixed(2)} kWh
Potencia requerida del sistema: ${potenciaRequerida.toFixed(2)} kW

🔌 ELECTRODOMÉSTICOS Y EQUIPOS SELECCIONADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${electrodomesticosTexto}

📊 RESUMEN TÉCNICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de equipos configurados: ${electrodomesticos.length} tipos diferentes
Consumo diario total calculado: ${consumoTotalDiario.toFixed(2)} kWh
Potencia total requerida: ${potenciaRequerida.toFixed(2)} kW
Estimación de paneles solares necesarios: ${Math.ceil(potenciaRequerida / 0.4)} paneles de 400W aproximadamente

${comentarios ? `💬 COMENTARIOS ADICIONALES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${comentarios}

` : ''}📋 PRÓXIMOS PASOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Revisión técnica de los requerimientos
2. Evaluación del sitio de instalación
3. Cálculo detallado del sistema solar
4. Elaboración de propuesta económica personalizada
5. Contacto directo con el cliente para coordinación

═══════════════════════════════════════════════════════════════
                    SUNCAR - Energía Solar para Cuba
                      Soluciones energéticas sostenibles
═══════════════════════════════════════════════════════════════

Esta solicitud fue generada automáticamente desde el sistema de cotización web de Suncar.
Para más información, visite: www.suncar.cu
    `.trim();

    return textoCompleto;
  }
}