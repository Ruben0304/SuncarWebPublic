import type { Metadata } from 'next'
import { obtenerContacto } from "@/lib/contacto"

export const metadata: Metadata = {
  title: 'Política de Privacidad - Suncar Hogar | Suncar',
  description: 'Política de privacidad de la app móvil Suncar Hogar desarrollada por Suncar SRL',
}

export default async function SuncarHogarPrivacyPage() {
  // El correo de avisos legales sale de la misma fuente que el resto del
  // sitio: si cambia la casilla de atención, cambia también acá.
  const contacto = await obtenerContacto()

  return (
    <div className="min-h-screen bg-[#F2F2EF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#012928] mb-4">
            Política de Privacidad
          </h1>
          <p className="text-xl text-[#AFEB17] font-semibold">
            Suncar Hogar
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            <strong>Última actualización:</strong> 3 de agosto de 2026
          </p>

          {/* Section 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700">
              Suncar Hogar es la app móvil con la que los clientes de Suncar monitorean, desde su
              teléfono, el sistema solar que les instalamos: batería, generación de paneles, consumo
              y si hay corriente de la calle. En Suncar SRL protegemos la información de quienes usan
              la app. Esta política describe qué datos recopilamos, por qué los usamos y cómo los
              resguardamos. El uso de la app implica aceptación de estas prácticas.
            </p>
          </section>

          {/* Section 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              2. Responsable del tratamiento
            </h2>
            <p className="text-gray-700">
              Suncar SRL actúa como responsable del procesamiento de los datos generados dentro de
              Suncar Hogar.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              3. Datos que recopilamos
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Datos de tu cuenta de FSolar:
                </h3>
                <p className="text-gray-700">
                  Para mostrarte tu sistema, inicias sesión con el usuario y contraseña de tu cuenta
                  en FSolar (la plataforma de monitoreo de Felicity Solar, el fabricante de tu
                  inversor). Tu contraseña viaja siempre cifrada y se guarda cifrada en nuestros
                  servidores — nunca en texto plano — para mantener la sesión activa con FSolar sin
                  pedírtela cada vez que abres la app.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Datos de sesión:
                </h3>
                <p className="text-gray-700">
                  Un token de acceso que se guarda en tu teléfono para mantenerte conectado entre
                  usos de la app, sin volver a pedirte usuario y contraseña.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Datos de tu sistema solar:
                </h3>
                <p className="text-gray-700">
                  Nivel de batería, potencia generada por tus paneles, consumo actual y disponibilidad
                  de corriente de la calle, obtenidos de la plataforma FSolar. Se muestran en tiempo
                  real dentro de la app y quedan también como histórico en nuestros servidores para
                  fines de soporte técnico.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 mt-4">
                <p className="text-gray-700 font-medium">
                  No solicitamos ubicación precisa, contactos, fotos, cámara, micrófono, ni datos
                  financieros o de pago.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              4. Finalidades
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Autenticarte y mostrarte únicamente los equipos asociados a tu cuenta.</li>
              <li>Mostrar en tiempo real el estado de tu sistema solar dentro de la app.</li>
              <li>Conservar un histórico básico para brindarte soporte técnico cuando lo necesites.</li>
              <li>Diagnosticar errores y mantener el servicio funcionando correctamente.</li>
              <li>Cumplir obligaciones legales y responder a requerimientos válidos.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              5. Bases legales
            </h2>
            <p className="text-gray-700">
              Procesamos datos con base en tu consentimiento (al iniciar sesión en la app) y en el
              interés legítimo de prestarte el servicio de monitoreo incluido con la instalación de tu
              sistema solar.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              6. Compartición de datos
            </h2>
            <p className="text-gray-700 mb-3">
              No vendemos información personal. Compartimos tus credenciales de acceso únicamente con
              FSolar (Felicity Solar), la plataforma del fabricante de tu equipo, porque es el origen
              de los datos que la app te muestra.
            </p>
            <p className="text-gray-700">
              Solo revelamos datos personales ante solicitudes legales válidas.
            </p>
          </section>

          {/* Section 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              7. Conservación
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>
                <strong>Credenciales de tu cuenta FSolar:</strong> mientras mantengas tu cuenta
                vinculada, hasta que la elimines desde la propia app.
              </li>
              <li>
                <strong>Histórico de telemetría de tu sistema:</strong> mientras tu cuenta esté
                vinculada, con fines de soporte técnico.
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              8. Seguridad
            </h2>
            <p className="text-gray-700 mb-3">
              Toda comunicación entre la app y nuestros servidores viaja cifrada (HTTPS). Tu
              contraseña de FSolar se almacena cifrada en nuestros servidores, nunca en texto plano,
              y nunca se guarda en tu teléfono.
            </p>
            <p className="text-gray-700">
              A pesar de estas medidas, ningún sistema es infalible; notificaremos cualquier incidente
              relevante según la normativa aplicable.
            </p>
          </section>

          {/* Section 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              9. Tus derechos y cómo eliminar tu cuenta
            </h2>
            <p className="text-gray-700 mb-3">
              Puedes eliminar tu cuenta directamente desde la app, sin necesidad de contactarnos: entra
              a <strong>Mi sistema solar → menú (⋮) → Eliminar cuenta</strong>. Esto borra de forma
              permanente las credenciales de tu cuenta FSolar guardadas en nuestros servidores; después
              tendrás que volver a iniciar sesión si quieres seguir usando la app. Esta acción no
              elimina tu cuenta en la plataforma FSolar en sí, ya que esa cuenta pertenece al
              fabricante del equipo, no a Suncar.
            </p>
            <p className="text-gray-700">
              También puedes ejercer derechos de acceso, rectificación o eliminación adicionales
              mediante nuestros canales oficiales de soporte. Atenderemos cada solicitud en un plazo
              máximo de 30 días, salvo requerimientos legales específicos.
            </p>
          </section>

          {/* Section 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
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
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              11. Menores de edad
            </h2>
            <p className="text-gray-700">
              Suncar Hogar está dirigida a clientes de Suncar con un sistema solar instalado a su
              nombre, no a menores de edad. Eliminaremos cualquier dato detectado de menores sin
              autorización verificable de sus tutores.
            </p>
          </section>

          {/* Section 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
              12. Actualizaciones de esta política
            </h2>
            <p className="text-gray-700">
              Podemos modificar esta política para reflejar cambios regulatorios o mejoras del
              servicio. Publicaremos la nueva fecha efectiva en esta misma página; te recomendamos
              revisarla periódicamente.
            </p>
          </section>

          {/* Section 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#012928] mb-4">
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
                Sitio web: <a href="https://suncarsrl.com" className="text-[#AFEB17] hover:underline" target="_blank" rel="noopener noreferrer">suncarsrl.com</a>
              </p>
              <p className="text-gray-700 mb-2">
                Correo electrónico: <a href={`mailto:${contacto.correo}`} className="text-[#AFEB17] hover:underline">{contacto.correo}</a>
              </p>
              <p className="text-gray-700">
                Teléfono: <a href="tel:+5378261062" className="text-[#AFEB17] hover:underline">+53 78261062</a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">
                Suncar Hogar es una aplicación desarrollada por Suncar SRL
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
