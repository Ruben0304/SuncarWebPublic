<script lang="ts">
  import { useContacto } from "~/lib/contacto.svelte";

  const datos = useContacto();
  const contacto = $derived(datos.contacto);

</script>

<section class="py-16 lg:py-20 bg-[#F2F2EF] relative overflow-hidden">
  <div class="absolute bottom-0 left-0 w-56 h-56 bg-[#012928]/8 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

  <div class="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">¿Listo para empezar?</h2>
        <div class="h-1 w-20 bg-secondary-gradient rounded-full mx-auto mb-4"></div>
        <p class="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
          Contáctanos ahora y comienza tu viaje hacia la energía solar
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6 lg:gap-8">
        <a
          href={`https://wa.me/${contacto.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          class="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-green-100"
        >
          <div class="flex items-start gap-5">
            <div class="bg-green-500 p-4 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-xl text-primary mb-2 group-hover:text-green-600 transition-colors">WhatsApp</h3>
              <p class="text-gray-600 mb-3 text-sm">Escríbenos directamente</p>
              <p class="text-2xl font-bold bg-secondary-gradient bg-clip-text text-transparent">{contacto.telefono}</p>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>

        <a
          href="https://www.google.com/maps?q=23.129769,-82.414698"
          target="_blank"
          rel="noopener noreferrer"
          class="group bg-gradient-to-br from-[#012928]/5 to-[#F2C300]/10 rounded-2xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-[#012928]/10"
        >
          <div class="flex items-start gap-5">
            <div class="bg-[#012928] p-4 rounded-xl text-[#F2C300] flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.527 4.799c1.212 2.608.937 5.678-.405 8.173-1.101 2.047-2.744 3.74-4.098 5.614-.619.858-1.244 1.75-1.669 2.727-.141.325-.263.658-.383.992-.121.333-.224.673-.34 1.008-.109.314-.236.684-.627.687h-.007c-.466-.001-.579-.53-.695-.887-.284-.874-.581-1.713-1.019-2.525-.51-.944-1.145-1.817-1.79-2.671L19.527 4.799zM8.545 7.705l-3.959 4.707c.724 1.54 1.821 2.863 2.871 4.18.247.31.494.622.737.936l4.984-5.925-.029.01c-1.741.601-3.691-.291-4.392-1.987a3.377 3.377 0 0 1-.209-.716c-.063-.437-.077-.761-.004-1.198l.001-.007zM5.492 3.149l-.003.004c-1.947 2.466-2.281 5.88-1.117 8.77l4.785-5.689-.058-.05-3.607-3.035zM14.661.436l-3.838 4.563a.295.295 0 0 1 .027-.01c1.6-.551 3.403.15 4.22 1.626.176.319.323.683.377 1.045.068.446.085.773.012 1.22l-.003.016 3.836-4.561A8.382 8.382 0 0 0 14.67.439l-.009-.003zM9.466 5.868L14.162.285l-.047-.012A8.31 8.31 0 0 0 11.986 0a8.439 8.439 0 0 0-6.169 2.766l-.016.018 3.665 3.084z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="font-bold text-xl text-primary mb-2 group-hover:text-[#012928] transition-colors">Visítanos</h3>
              <p class="text-gray-600 mb-3 text-sm">Ver en Google Maps</p>
              <p class="text-lg font-semibold text-primary leading-relaxed">{contacto.direccion}</p>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg class="w-6 h-6 text-[#012928]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </a>
      </div>

      <div class="text-center mt-10">
        <a
          href="/contacto"
          class="inline-flex items-center gap-2 text-primary hover:text-[#012928]/60 font-semibold transition-colors duration-300 group"
        >
          <span>Ver más opciones de contacto</span>
          <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  </div>
</section>
