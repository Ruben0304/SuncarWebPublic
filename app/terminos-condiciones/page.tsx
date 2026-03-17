import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones - Suncar',
  description: 'Términos y condiciones de uso de los servicios de Suncar',
}

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-[#0F2B66] mb-8">
          Términos y Condiciones
        </h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Fecha de última actualización:</strong> {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="text-gray-700 mb-4">
              Bienvenido a Suncar. Al acceder y utilizar nuestro sitio web, aplicación móvil y servicios,
              aceptas estar sujeto a estos Términos y Condiciones. Si no estás de acuerdo con alguna
              parte de estos términos, no debes utilizar nuestros servicios.
            </p>
            <p className="text-gray-700">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
              entrarán en vigor inmediatamente después de su publicación en esta página.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              2. Descripción de los Servicios
            </h2>
            <p className="text-gray-700 mb-3">
              Suncar ofrece servicios relacionados con energía solar fotovoltaica, incluyendo:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Diseño e instalación de sistemas solares fotovoltaicos</li>
              <li>Venta de equipos y componentes solares</li>
              <li>Asesoramiento y consultoría energética</li>
              <li>Mantenimiento y servicio técnico</li>
              <li>Calculadora de consumo energético</li>
              <li>Generación de cotizaciones personalizadas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              3. Uso del Sitio Web y Aplicación
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.1 Licencia de Uso
            </h3>
            <p className="text-gray-700 mb-4">
              Te otorgamos una licencia limitada, no exclusiva, no transferible y revocable para
              acceder y utilizar nuestros servicios digitales para fines personales y comerciales
              legítimos relacionados con la energía solar.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              3.2 Restricciones de Uso
            </h3>
            <p className="text-gray-700 mb-3">
              Al utilizar nuestros servicios, te comprometes a NO:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Utilizar los servicios para fines ilegales o no autorizados</li>
              <li>Intentar acceder a áreas restringidas del sistema</li>
              <li>Interferir con el funcionamiento de nuestros servicios</li>
              <li>Copiar, modificar o distribuir contenido sin autorización</li>
              <li>Realizar ingeniería inversa de nuestro software</li>
              <li>Transmitir virus, malware o código malicioso</li>
              <li>Suplantar la identidad de otra persona o entidad</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              4. Cotizaciones y Ofertas
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              4.1 Validez de Cotizaciones
            </h3>
            <p className="text-gray-700 mb-4">
              Las cotizaciones generadas a través de nuestra plataforma son estimaciones basadas
              en la información proporcionada por el usuario. Los precios finales pueden variar
              según las condiciones específicas del proyecto, disponibilidad de productos y
              evaluación técnica en sitio.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              4.2 Vigencia de Precios
            </h3>
            <p className="text-gray-700 mb-4">
              Los precios indicados en las cotizaciones tienen una validez de 30 días calendario
              desde su emisión, salvo que se especifique lo contrario. Después de este período,
              los precios están sujetos a revisión.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              5. Servicios de Instalación
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5.1 Evaluación Técnica
            </h3>
            <p className="text-gray-700 mb-4">
              Antes de cualquier instalación, realizaremos una evaluación técnica del sitio para
              determinar la viabilidad del proyecto. Nos reservamos el derecho de rechazar
              proyectos que no cumplan con los requisitos técnicos o de seguridad necesarios.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5.2 Responsabilidades del Cliente
            </h3>
            <p className="text-gray-700 mb-3">
              El cliente se compromete a:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Proporcionar acceso seguro al sitio de instalación</li>
              <li>Garantizar que la estructura del inmueble soporte el sistema</li>
              <li>Obtener permisos necesarios de autoridades locales</li>
              <li>Proporcionar información veraz sobre consumo eléctrico</li>
              <li>Mantener las condiciones acordadas durante la instalación</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              5.3 Plazos de Instalación
            </h3>
            <p className="text-gray-700 mb-4">
              Los plazos de instalación son estimados y pueden variar según condiciones climáticas,
              disponibilidad de materiales, permisos y otras circunstancias fuera de nuestro control.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              6. Garantías
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6.1 Garantía de Productos
            </h3>
            <p className="text-gray-700 mb-4">
              Los productos que vendemos están respaldados por las garantías del fabricante.
              Los términos específicos de garantía varían según el producto y se detallarán
              en la documentación de cada proyecto.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6.2 Garantía de Instalación
            </h3>
            <p className="text-gray-700 mb-4">
              Garantizamos la calidad de nuestras instalaciones por un período especificado
              en el contrato de servicio. Esta garantía cubre defectos de mano de obra y
              no incluye daños causados por mal uso, negligencia o eventos de fuerza mayor.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              6.3 Exclusiones de Garantía
            </h3>
            <p className="text-gray-700 mb-3">
              Las garantías no cubren:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Daños causados por desastres naturales o eventos climáticos extremos</li>
              <li>Modificaciones no autorizadas del sistema</li>
              <li>Falta de mantenimiento preventivo</li>
              <li>Uso inadecuado o negligente del equipo</li>
              <li>Daños causados por terceros</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              7. Pagos y Facturación
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              7.1 Métodos de Pago
            </h3>
            <p className="text-gray-700 mb-4">
              Aceptamos diversos métodos de pago que se especificarán en cada cotización.
              Los términos de pago pueden incluir anticipos, pagos parciales y pago final
              según el alcance del proyecto.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              7.2 Retrasos en Pagos
            </h3>
            <p className="text-gray-700 mb-4">
              Los retrasos en los pagos pueden resultar en la suspensión de servicios,
              intereses por mora y/o cancelación del proyecto. Nos reservamos el derecho
              de retener la entrega o instalación hasta recibir el pago correspondiente.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              8. Cancelaciones y Reembolsos
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              8.1 Cancelación por el Cliente
            </h3>
            <p className="text-gray-700 mb-4">
              El cliente puede cancelar un proyecto antes del inicio de la instalación.
              Los reembolsos estarán sujetos a deducciones por costos administrativos,
              materiales adquiridos y servicios ya prestados.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              8.2 Cancelación por Suncar
            </h3>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de cancelar un proyecto si el cliente incumple
              con los términos acordados, proporciona información falsa o si las condiciones
              del sitio no permiten una instalación segura.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              9. Limitación de Responsabilidad
            </h2>
            <p className="text-gray-700 mb-3">
              En la máxima medida permitida por la ley:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>No seremos responsables por daños indirectos, incidentales o consecuentes</li>
              <li>Nuestra responsabilidad total no excederá el monto pagado por el servicio</li>
              <li>No garantizamos ahorros energéticos específicos, ya que dependen de múltiples factores</li>
              <li>No somos responsables por interrupciones del servicio eléctrico de la red pública</li>
              <li>No nos hacemos responsables por cambios en regulaciones o tarifas eléctricas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              10. Propiedad Intelectual
            </h2>
            <p className="text-gray-700 mb-4">
              Todo el contenido de nuestro sitio web y aplicación, incluyendo textos, gráficos,
              logos, imágenes, software y diseños, es propiedad de Suncar o de nuestros
              licenciantes y está protegido por leyes de propiedad intelectual.
            </p>
            <p className="text-gray-700">
              No puedes reproducir, distribuir, modificar o crear trabajos derivados sin
              nuestro consentimiento expreso por escrito.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              11. Privacidad y Protección de Datos
            </h2>
            <p className="text-gray-700">
              El uso de nuestros servicios también está sujeto a nuestra{' '}
              <a href="/privacidad" className="text-[#F26729] hover:underline">
                Política de Privacidad
              </a>
              , que describe cómo recopilamos, usamos y protegemos tu información personal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              12. Fuerza Mayor
            </h2>
            <p className="text-gray-700">
              No seremos responsables por el incumplimiento de nuestras obligaciones debido a
              circunstancias fuera de nuestro control razonable, incluyendo desastres naturales,
              guerras, pandemias, huelgas, escasez de materiales, fallas de proveedores o
              cambios en regulaciones gubernamentales.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              13. Resolución de Disputas
            </h2>
            <p className="text-gray-700 mb-4">
              En caso de cualquier disputa relacionada con nuestros servicios, las partes
              acuerdan intentar resolver el conflicto de manera amistosa mediante negociación
              directa antes de recurrir a procedimientos legales.
            </p>
            <p className="text-gray-700">
              Estos términos se rigen por las leyes de Cuba. Cualquier disputa legal será
              sometida a la jurisdicción de los tribunales competentes en Cuba.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              14. Divisibilidad
            </h2>
            <p className="text-gray-700">
              Si alguna disposición de estos términos se considera inválida o inaplicable,
              las disposiciones restantes continuarán en pleno vigor y efecto.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#0F2B66] mb-4">
              15. Contacto
            </h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre estos Términos y Condiciones, puedes contactarnos:
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
              16. Aceptación
            </h2>
            <p className="text-gray-700">
              Al utilizar nuestros servicios, confirmas que has leído, comprendido y aceptado
              estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguna
              parte de estos términos, debes dejar de utilizar nuestros servicios inmediatamente.
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
