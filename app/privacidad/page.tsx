import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - Suncar',
  description: 'Política de privacidad y protección de datos de Suncar',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-[#0F2B66] mb-8">
          Política de Privacidad
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Fecha de última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              1. Introducción
            </h2>
            <p className="text-gray-700 mb-4">
              Suncar ("nosotros", "nuestro" o "la empresa") se compromete a proteger la privacidad
              de nuestros usuarios. Esta Política de Privacidad describe cómo recopilamos, usamos,
              almacenamos y protegemos la información personal que nos proporcionas a través de
              nuestro sitio web y aplicación móvil.
            </p>
            <p className="text-gray-700">
              Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política.
              Si no estás de acuerdo con estos términos, por favor no utilices nuestros servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              2. Información que Recopilamos
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.1 Información Personal
            </h3>
            <p className="text-gray-700 mb-3">
              Podemos recopilar la siguiente información personal cuando utilizas nuestros servicios:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Nombre completo</li>
              <li>Dirección de correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Dirección física (para instalaciones y servicios)</li>
              <li>Información de ubicación (cuando solicitas servicios)</li>
              <li>Información sobre consumo eléctrico y electrodomésticos (para cotizaciones)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              2.2 Información Técnica
            </h3>
            <p className="text-gray-700 mb-3">
              Automáticamente recopilamos cierta información técnica cuando visitas nuestro sitio web o aplicación:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Dirección IP</li>
              <li>Tipo de navegador y versión</li>
              <li>Sistema operativo</li>
              <li>Páginas visitadas y tiempo de navegación</li>
              <li>Información del dispositivo móvil</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              3. Cómo Utilizamos tu Información
            </h2>
            <p className="text-gray-700 mb-3">
              Utilizamos la información recopilada para los siguientes propósitos:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Proporcionar y mejorar nuestros servicios de energía solar</li>
              <li>Procesar solicitudes de cotización y contacto</li>
              <li>Comunicarnos contigo sobre nuestros servicios</li>
              <li>Realizar instalaciones y dar seguimiento a proyectos</li>
              <li>Enviar información relevante sobre productos y servicios</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
              <li>Mejorar la experiencia del usuario en nuestra plataforma</li>
              <li>Analizar el uso de nuestros servicios para optimizarlos</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              4. Compartir Información
            </h2>
            <p className="text-gray-700 mb-3">
              No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en las siguientes circunstancias:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>
                <strong>Proveedores de servicios:</strong> Compartimos información con proveedores que nos ayudan a operar nuestro negocio (hosting, análisis, comunicaciones)
              </li>
              <li>
                <strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos legales
              </li>
              <li>
                <strong>Con tu consentimiento:</strong> En cualquier otro caso, solicitaremos tu autorización expresa
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              5. Seguridad de los Datos
            </h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger
              tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              Estas medidas incluyen:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Encriptación de datos en tránsito y en reposo</li>
              <li>Acceso restringido a información personal</li>
              <li>Monitoreo regular de nuestros sistemas de seguridad</li>
              <li>Capacitación de nuestro personal en protección de datos</li>
            </ul>
            <p className="text-gray-700">
              Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico
              es 100% seguro. No podemos garantizar la seguridad absoluta de tu información.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              6. Retención de Datos
            </h2>
            <p className="text-gray-700">
              Conservamos tu información personal solo durante el tiempo necesario para cumplir con
              los propósitos descritos en esta política, a menos que la ley requiera o permita un
              período de retención más prolongado. Los datos de proyectos completados se mantienen
              para garantía y servicio postventa.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              7. Tus Derechos
            </h2>
            <p className="text-gray-700 mb-3">
              Tienes los siguientes derechos respecto a tu información personal:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Acceso:</strong> Solicitar una copia de la información que tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Solicitar la corrección de información inexacta</li>
              <li><strong>Eliminación:</strong> Solicitar la eliminación de tu información personal</li>
              <li><strong>Restricción:</strong> Solicitar limitar el procesamiento de tus datos</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en un formato estructurado</li>
              <li><strong>Objeción:</strong> Oponerte al procesamiento de tus datos para ciertos fines</li>
            </ul>
            <p className="text-gray-700">
              Para ejercer cualquiera de estos derechos, contáctanos a través de los medios indicados
              en la sección de contacto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              8. Cookies y Tecnologías Similares
            </h2>
            <p className="text-gray-700 mb-3">
              Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web.
              Las cookies nos ayudan a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Recordar tus preferencias y configuraciones</li>
              <li>Entender cómo utilizas nuestros servicios</li>
              <li>Mejorar el rendimiento del sitio web</li>
              <li>Personalizar contenido relevante</li>
            </ul>
            <p className="text-gray-700">
              Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar
              la funcionalidad de algunos servicios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              9. Enlaces a Terceros
            </h2>
            <p className="text-gray-700">
              Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables
              de las prácticas de privacidad de estos sitios. Te recomendamos leer las políticas
              de privacidad de cada sitio web que visites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              10. Privacidad de Menores
            </h2>
            <p className="text-gray-700">
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos
              intencionalmente información personal de menores. Si descubrimos que hemos
              recopilado información de un menor, la eliminaremos de inmediato.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              11. Cambios a esta Política
            </h2>
            <p className="text-gray-700">
              Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos
              sobre cambios significativos publicando la nueva política en esta página y
              actualizando la fecha de "última actualización". Te recomendamos revisar esta
              política regularmente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              12. Contacto
            </h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas, comentarios o solicitudes relacionadas con esta Política de Privacidad
              o el manejo de tu información personal, puedes contactarnos:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Suncar</strong>
              </p>
              <p className="text-gray-700 mb-2">
                Correo electrónico: <a href="mailto:info@suncar.cu" className="text-[#F26729] hover:underline">info@suncar.cu</a>
              </p>
              <p className="text-gray-700 mb-2">
                Teléfono: <a href="tel:+5378261062" className="text-[#F26729] hover:underline">+53 78261062</a>
              </p>
              <p className="text-gray-700">
                Dirección: Cuba
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              13. Consentimiento
            </h2>
            <p className="text-gray-700">
              Al utilizar nuestros servicios, confirmas que has leído y comprendido esta Política
              de Privacidad y aceptas la recopilación, uso y divulgación de tu información personal
              como se describe en este documento.
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              © {new Date().getFullYear()} Suncar. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
