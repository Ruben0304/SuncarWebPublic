<script lang="ts">
  import CheckCircle from "lucide-svelte/icons/circle-check";
  import Send from "lucide-svelte/icons/send";

  // El número sale del servidor (la misma fuente que el resto del sitio).
  let { whatsapp }: { whatsapp: string } = $props();

  const vacio = { name: "", email: "", phone: "", subject: "", message: "" };
  let datos = $state({ ...vacio });
  let enviando = $state(false);
  let enviado = $state(false);

  function enviar(e: SubmitEvent) {
    e.preventDefault();
    enviando = true;

    // El mensaje se manda por WhatsApp: no hay backend de formularios.
    const mensaje = `Hola! Me gustaría contactar con Suncar para:

*Nombre:* ${datos.name}
*Email:* ${datos.email}
*Teléfono:* ${datos.phone}
*Asunto:* ${datos.subject}

*Mensaje:*
${datos.message}

¡Espero su respuesta!`;
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;

    setTimeout(() => {
      enviando = false;
      window.open(url, "_blank");
      enviado = true;
      datos = { ...vacio };
    }, 1000);
  }

  const campo =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300";
</script>

<div class="bg-white rounded-2xl shadow-xl p-8 lg:p-10 relative overflow-hidden">
  <div class="absolute top-0 right-0 w-32 h-32 bg-secondary-gradient/5 rounded-full -translate-y-16 translate-x-16"></div>

  <div class="relative z-10">
    <div class="mb-8">
      <h2 class="text-2xl lg:text-3xl font-bold text-primary mb-4">¿Qué necesitas?</h2>
      <p class="text-gray-600 leading-relaxed">
        Completa el formulario y te contactaremos en menos de 24 horas para ofrecerte una propuesta personalizada
      </p>
    </div>

    {#if enviado}
      <div class="text-center py-12">
        <CheckCircle class="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-primary mb-2">¡Mensaje Enviado!</h3>
        <p class="text-gray-600 mb-6">Gracias por contactarnos. Te responderemos muy pronto.</p>
        <button
          type="button"
          onclick={() => (enviado = false)}
          class="px-6 py-3 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Enviar Otro Mensaje
        </button>
      </div>
    {:else}
      <form onsubmit={enviar} class="space-y-6">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label for="contacto-name" class="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
            <input id="contacto-name" type="text" name="name" bind:value={datos.name} required class={campo} placeholder="Tu nombre completo" />
          </div>
          <div>
            <label for="contacto-phone" class="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
            <input id="contacto-phone" type="tel" name="phone" bind:value={datos.phone} required class={campo} placeholder="+53 5 xxx-xxxx" />
          </div>
        </div>

        <div>
          <label for="contacto-email" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
          <input id="contacto-email" type="email" name="email" bind:value={datos.email} required class={campo} placeholder="tu@email.com" />
        </div>

        <div>
          <label for="contacto-subject" class="block text-sm font-semibold text-gray-700 mb-2">Asunto *</label>
          <select id="contacto-subject" name="subject" bind:value={datos.subject} required class={campo}>
            <option value="">Selecciona un tema</option>
            <option value="cotizacion">Solicitar Cotización</option>
            <option value="instalacion">Información de Instalación</option>
            <option value="mantenimiento">Soporte Técnico</option>
            <option value="financiamiento">Opciones de Financiamiento</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div>
          <label for="contacto-message" class="block text-sm font-semibold text-gray-700 mb-2">Mensaje *</label>
          <textarea
            id="contacto-message"
            name="message"
            bind:value={datos.message}
            required
            rows="5"
            class={`${campo} resize-none`}
            placeholder="Cuéntanos sobre tu proyecto solar, consumo eléctrico actual, ubicación de tu hogar, etc."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={enviando}
          class="w-full px-6 py-4 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {#if enviando}
            <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {:else}
            <Send class="w-5 h-5" />
          {/if}
          {enviando ? "Enviando..." : "Enviar Mensaje"}
        </button>
      </form>
    {/if}
  </div>
</div>
