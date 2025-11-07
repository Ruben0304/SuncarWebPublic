import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Solar Survivor | Suncar',
  description: 'Política de privacidad del simulador Solar Survivor desarrollado por Suncar SRL',
}

export default function SolarSurvivorPrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#0F2B66] mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-[#F26729] font-semibold">
            Solar Survivor
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Última actualización:</strong> 17 de febrero de 2025
          </p>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700">
              En Suncar SRL protegemos la información de quienes usan Solar Survivor. Esta política
              describe qué datos recopilamos, por qué los usamos y cómo los resguardamos. El uso de
              la app implica aceptación de estas prácticas.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              2. Responsable del tratamiento
            </h2>
            <p className="text-gray-700">
              Suncar SRL actúa como responsable del procesamiento de los datos generados dentro de
              Solar Survivor.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              3. Datos que recopilamos
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Datos técnicos:
                </h3>
                <p className="text-gray-700">
                  Modelo de dispositivo, sistema operativo, identificadores anónimos y métricas de
                  rendimiento o fallos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Datos de uso:
                </h3>
                <p className="text-gray-700">
                  Pantallas visitadas, configuraciones elegidas (paneles, baterías, apagones), progreso
                  y eventos del juego.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Información de soporte:
                </h3>
                <p className="text-gray-700">
                  Información que compartes cuando solicitas soporte mediante nuestros canales oficiales
                  externos.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <p className="text-gray-700 font-medium">
                  No solicitamos datos sensibles, ubicación precisa, contactos, fotos, audio ni
                  información financiera.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              4. Finalidades
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Garantizar el funcionamiento correcto de la app y diagnosticar errores.</li>
              <li>Analizar tendencias de uso para mejorar mecánicas de juego y kits sugeridos.</li>
              <li>Proporcionar asistencia cuando envías una consulta voluntaria.</li>
              <li>Cumplir obligaciones legales y responder a requerimientos válidos.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              5. Bases legales
            </h2>
            <p className="text-gray-700">
              Procesamos datos con base en tu consentimiento (al usar la app), en el interés legítimo
              de mejorar la experiencia y, cuando aplique, en el cumplimiento de obligaciones legales.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              6. Compartición de datos
            </h2>
            <p className="text-gray-700 mb-3">
              No vendemos información personal. Podemos compartir datos anonimizados con proveedores
              de analítica y almacenamiento que operan bajo contratos de confidencialidad y medidas
              de seguridad equivalentes.
            </p>
            <p className="text-gray-700">
              Solo revelamos datos personales ante solicitudes legales válidas.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              7. Conservación
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Telemetría y datos de uso:</strong> hasta 24 meses desde su registro.
              </li>
              <li>
                <strong>Comunicaciones de soporte:</strong> hasta 18 meses desde la última interacción
                o hasta que solicites su eliminación cuando la ley lo permita.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              8. Seguridad
            </h2>
            <p className="text-gray-700 mb-3">
              Empleamos cifrado en tránsito, controles de acceso internos, registros de auditoría y
              monitoreo continuo.
            </p>
            <p className="text-gray-700">
              A pesar de estas medidas, ningún sistema es infalible; notificaremos cualquier incidente
              relevante según la normativa aplicable.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              9. Derechos del usuario
            </h2>
            <p className="text-gray-700 mb-3">
              Puedes ejercer derechos de acceso, rectificación, actualización, eliminación, portabilidad
              u oposición mediante nuestros canales oficiales de soporte (web o formularios indicados en
              suncarsrl.com).
            </p>
            <p className="text-gray-700">
              Atenderemos cada solicitud en un plazo máximo de 30 días, salvo requerimientos legales
              específicos.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              10. Transferencias internacionales
            </h2>
            <p className="text-gray-700">
              Cuando se almacenan datos en servicios ubicados fuera de tu país, garantizamos niveles
              adecuados de protección mediante cláusulas contractuales estándar u otros mecanismos
              reconocidos.
            </p>
          </section>

          {/* Section 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              11. Menores de edad
            </h2>
            <p className="text-gray-700">
              La app está dirigida a mayores de 16 años. Eliminaremos cualquier dato detectado de
              menores sin autorización verificable de sus tutores.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              12. Actualizaciones de esta política
            </h2>
            <p className="text-gray-700">
              Podemos modificar esta política para reflejar cambios regulatorios o mejoras del servicio.
              Publicaremos la nueva fecha efectiva dentro de la app o en suncarsrl.com; te recomendamos
              revisarla periódicamente.
            </p>
          </section>

          {/* Section 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              13. Contacto y soporte
            </h2>
            <p className="text-gray-700 mb-4">
              Para consultas, solicitudes o reportes relacionados con privacidad usa los canales de
              soporte listados en suncarsrl.com. No es necesario proporcionar datos adicionales salvo
              los requeridos para atender tu solicitud.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Suncar SRL</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Sitio web: <a href="https://suncarsrl.com" className="text-[#F26729] hover:underline" target="_blank" rel="noopener noreferrer">suncarsrl.com</a>
              </p>
              <p className="text-gray-700 mb-2">
                Correo electrónico: <a href="mailto:info@suncar.cu" className="text-[#F26729] hover:underline">info@suncar.cu</a>
              </p>
              <p className="text-gray-700">
                Teléfono: <a href="tel:+5378261062" className="text-[#F26729] hover:underline">+53 78261062</a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Solar Survivor es una aplicación desarrollada por Suncar SRL
              </p>
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Suncar SRL. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
