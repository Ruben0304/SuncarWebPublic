<script lang="ts">
  import Calculator from "lucide-svelte/icons/calculator";
  import Zap from "lucide-svelte/icons/zap";
  import Home from "lucide-svelte/icons/house";
  import CheckCircle from "lucide-svelte/icons/circle-check";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import Sun from "lucide-svelte/icons/sun";
  import Loader2 from "lucide-svelte/icons/loader-circle";
  import { clientCotizacionService } from "@/services/api/clientCotizacionService";
  import type { CotizacionData } from "@/services/domain/interfaces/cotizacionInterfaces";
  import MapaUbicacion from "./MapaUbicacion.svelte";

  interface FormData {
    homeType: string;
    roofType: string;
    monthlyBill: string;
    familySize: string;
    appliances: string[];
    applianceQuantities: Record<string, number>;
    name: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    latitude: number;
    longitude: number;
  }

  // Coordenadas de La Habana por defecto
  const formularioVacio = (): FormData => ({
    homeType: "",
    roofType: "",
    monthlyBill: "",
    familySize: "",
    appliances: [],
    applianceQuantities: {},
    name: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    latitude: 23.1136,
    longitude: -82.3666,
  });

  const appliances = [
    { name: "Aire Acondicionado", icon: "❄️", potencia: 2500, horasUso: 8 },
    { name: "Refrigerador", icon: "🧊", potencia: 150, horasUso: 24 },
    { name: "Lavadora", icon: "👕", potencia: 500, horasUso: 2 },
    { name: "Televisor", icon: "📺", potencia: 100, horasUso: 6 },
    { name: "Computadora", icon: "💻", potencia: 300, horasUso: 8 },
    { name: "Microondas", icon: "🍽️", potencia: 1200, horasUso: 1 },
    { name: "Plancha", icon: "👔", potencia: 1500, horasUso: 1 },
    { name: "Bomba de Agua", icon: "💧", potencia: 750, horasUso: 2 },
  ];

  let step = $state(1);
  let formData = $state<FormData>(formularioVacio());
  let isSubmitting = $state(false);
  let submitStatus = $state<{ type: "error"; message: string } | null>(null);
  let isSubmitted = $state(false);

  function handleApplianceChange(appliance: string) {
    if (formData.appliances.includes(appliance)) {
      formData.appliances = formData.appliances.filter((a) => a !== appliance);
      const { [appliance]: _, ...resto } = formData.applianceQuantities;
      formData.applianceQuantities = resto;
    } else {
      formData.appliances = [...formData.appliances, appliance];
      formData.applianceQuantities = { ...formData.applianceQuantities, [appliance]: 1 };
    }
  }

  function handleQuantityChange(appliance: string, quantity: string) {
    formData.applianceQuantities = {
      ...formData.applianceQuantities,
      [appliance]: parseInt(quantity) || 1,
    };
  }

  async function submitQuotation() {
    isSubmitting = true;
    submitStatus = null;

    try {
      // Transformar datos del formulario al formato esperado
      const electrodomesticosSeleccionados = formData.appliances.map((applianceName) => {
        const appliance = appliances.find((a) => a.name === applianceName);
        const cantidad = formData.applianceQuantities[applianceName] || 1;
        const potencia = appliance?.potencia || 0;
        const horasUso = appliance?.horasUso || 0;
        const consumoDiario = (potencia * horasUso * cantidad) / 1000; // kWh

        return { nombre: applianceName, cantidad, potencia, horasUso, consumoDiario };
      });

      const consumoTotalDiario = electrodomesticosSeleccionados.reduce(
        (total, electro) => total + electro.consumoDiario,
        0,
      );

      const potenciaRequerida = consumoTotalDiario * 1.3; // Factor de seguridad

      // Separar dirección en municipio/provincia (simplificado)
      const direccionParts = formData.address.split(", ");
      const municipio = direccionParts.length > 1 ? direccionParts[direccionParts.length - 2] : "No especificado";
      const provincia = direccionParts.length > 0 ? direccionParts[direccionParts.length - 1] : "No especificado";

      const cotizacionData: CotizacionData = {
        nombre: formData.name,
        telefono: formData.phone,
        email: formData.email,
        direccion: formData.address,
        municipio,
        provincia,
        consumoMensual: parseInt(formData.monthlyBill) * 30 || 0, // Estimación kWh mensual
        tipoInstalacion:
          formData.homeType === "Casa"
            ? "residencial"
            : formData.homeType === "Local Comercial"
              ? "comercial"
              : "residencial",
        electrodomesticos: electrodomesticosSeleccionados,
        consumoTotalDiario,
        potenciaRequerida,
        comentarios: formData.description || "",
        fechaSolicitud: new Date().toISOString(),
        latitude: formData.latitude,
        longitude: formData.longitude,
      };

      const response = await clientCotizacionService.enviarCotizacion(cotizacionData);

      if (response.success) {
        isSubmitted = true;
        step = 4;
      } else {
        submitStatus = { type: "error", message: response.message || "Error al enviar la cotización" };
      }
    } catch (error) {
      console.error("Error enviando cotización:", error);
      submitStatus = { type: "error", message: "Error de conexión. Por favor, intenta nuevamente." };
    } finally {
      isSubmitting = false;
    }
  }

  function nextStep() {
    if (step < 3) {
      step += 1;
    } else {
      submitQuotation();
    }
  }

  function prevStep() {
    if (step > 1) step -= 1;
  }

  function handleLocationChange(lat: number, lng: number, address: string) {
    formData.latitude = lat;
    formData.longitude = lng;
    formData.address = address;
  }

  function resetQuote() {
    step = 1;
    isSubmitted = false;
    submitStatus = null;
    formData = formularioVacio();
  }

  const opcionClase = (activa: boolean) =>
    `p-4 rounded-lg border-2 transition-all duration-300 ${
      activa ? "border-primary bg-primary/5 text-primary" : "border-gray-300 hover:border-primary/50"
    }`;

  const botonSiguiente =
    "px-8 py-3 bg-[#012928] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2";
  const botonAnterior =
    "px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300";
  const campo =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300";
</script>

<!-- Barra de progreso -->
<div class="bg-[#F2F2EF] py-8">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-4">
        {#each [1, 2, 3, 4] as stepNumber (stepNumber)}
          <div class="flex items-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm {step >= stepNumber
                ? 'bg-[#012928] text-white'
                : 'bg-gray-300 text-gray-600'}"
            >
              {#if stepNumber === 4 && isSubmitted}
                <CheckCircle class="w-5 h-5" />
              {:else}
                {stepNumber}
              {/if}
            </div>
            {#if stepNumber < 4}
              <div class="w-16 sm:w-24 h-1 mx-2 {step > stepNumber ? 'bg-[#012928]' : 'bg-gray-300'}"></div>
            {/if}
          </div>
        {/each}
      </div>
      <div class="flex justify-between text-xs sm:text-sm font-medium text-gray-600">
        <span>Hogar</span>
        <span>Consumo</span>
        <span>Contacto</span>
        <span>Enviado</span>
      </div>
    </div>
  </div>
</div>

<!-- Formulario -->
<section class="py-16 lg:py-20 bg-[#F2F2EF]">
  <div class="container mx-auto px-4 md:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      <!-- Paso 1: Hogar -->
      {#if step === 1}
        <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
          <div class="text-center mb-8">
            <Home class="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 class="text-2xl lg:text-3xl font-bold text-primary mb-4">Información de tu Hogar</h2>
            <p class="text-gray-600">Cuéntanos sobre tu propiedad para personalizar tu cotización</p>
          </div>

          <div class="space-y-6">
            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-3">Tipo de Vivienda</span>
              <div class="grid sm:grid-cols-2 gap-4">
                {#each ["Casa", "Apartamento", "Local Comercial", "Otro"] as type (type)}
                  <button type="button" onclick={() => (formData.homeType = type)} class={opcionClase(formData.homeType === type)}>
                    {type}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-3">Tipo de Techo</span>
              <div class="grid sm:grid-cols-3 gap-4">
                {#each ["Hormigón", "Tejas", "Zinc"] as type (type)}
                  <button type="button" onclick={() => (formData.roofType = type)} class={opcionClase(formData.roofType === type)}>
                    {type}
                  </button>
                {/each}
              </div>
            </div>

            <div class="flex justify-end">
              <button onclick={nextStep} disabled={!formData.homeType || !formData.roofType} class={botonSiguiente}>
                Siguiente <ArrowRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Paso 2: Consumo -->
      {#if step === 2}
        <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
          <div class="text-center mb-8">
            <Zap class="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 class="text-2xl lg:text-3xl font-bold text-primary mb-4">Consumo Energético</h2>
            <p class="text-gray-600">Ayúdanos a dimensionar tu sistema solar perfecto</p>
          </div>

          <div class="space-y-6">
            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-3">Factura Eléctrica Mensual (CUP)</span>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {#each ["Menos de 1000", "1000-3000", "3000-6000", "6000-12000", "Más de 12000"] as range (range)}
                  <button
                    type="button"
                    onclick={() => (formData.monthlyBill = range.split("-")[0])}
                    class={opcionClase(formData.monthlyBill === range.split("-")[0])}
                  >
                    {range}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-3">Personas en el Hogar</span>
              <div class="grid grid-cols-4 gap-4">
                {#each ["1-2", "3-4", "5-6", "7+"] as size (size)}
                  <button
                    type="button"
                    onclick={() => (formData.familySize = size.split("-")[0])}
                    class={opcionClase(formData.familySize === size.split("-")[0])}
                  >
                    {size}
                  </button>
                {/each}
              </div>
            </div>

            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-3">
                Electrodomésticos Principales (selecciona los que tienes)
              </span>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p class="text-sm text-blue-700">
                  <span class="font-semibold">💡 Información importante:</span> La selección de electrodomésticos es
                  <strong>opcional</strong> y nos ayuda a entender mejor tus necesidades energéticas para diseñar un sistema personalizado.
                </p>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {#each appliances as appliance (appliance.name)}
                  {@const seleccionado = formData.appliances.includes(appliance.name)}
                  <div class="space-y-2">
                    <button
                      type="button"
                      onclick={() => handleApplianceChange(appliance.name)}
                      class="w-full {opcionClase(seleccionado)} text-center"
                    >
                      <div class="text-2xl mb-2">{appliance.icon}</div>
                      <div class="text-xs font-medium">{appliance.name}</div>
                    </button>
                    {#if seleccionado}
                      <div class="flex items-center gap-2 px-2">
                        <label class="text-xs text-gray-600 font-medium" for="cantidad-{appliance.name}">Cantidad:</label>
                        <select
                          id="cantidad-{appliance.name}"
                          value={formData.applianceQuantities[appliance.name] || 1}
                          onchange={(e) => handleQuantityChange(appliance.name, e.currentTarget.value)}
                          class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                        >
                          {#each [1, 2, 3, 4, 5] as num (num)}
                            <option value={num}>{num}</option>
                          {/each}
                        </select>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            </div>

            <div class="flex justify-between">
              <button onclick={prevStep} class={botonAnterior}>Anterior</button>
              <button onclick={nextStep} disabled={!formData.monthlyBill || !formData.familySize} class={botonSiguiente}>
                Siguiente <ArrowRight class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Paso 3: Contacto y ubicación -->
      {#if step === 3}
        <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
          <div class="text-center mb-8">
            <Calculator class="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 class="text-2xl lg:text-3xl font-bold text-primary mb-4">Información de Contacto y Ubicación</h2>
            <p class="text-gray-600">
              Para que nuestro equipo técnico pueda contactarte y diseñar tu sistema solar personalizado
            </p>
          </div>

          <div class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="cot-name" class="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo *</label>
                <input
                  id="cot-name"
                  type="text"
                  name="name"
                  bind:value={formData.name}
                  required
                  class={campo}
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label for="cot-phone" class="block text-sm font-semibold text-gray-700 mb-2">Teléfono *</label>
                <input
                  id="cot-phone"
                  type="tel"
                  name="phone"
                  bind:value={formData.phone}
                  required
                  class={campo}
                  placeholder="+53 5 xxx-xxxx"
                />
              </div>
            </div>

            <div>
              <label for="cot-email" class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input
                id="cot-email"
                type="email"
                name="email"
                bind:value={formData.email}
                required
                class={campo}
                placeholder="tu@email.com"
              />
            </div>

            <!-- Ubicación con mapa -->
            <div>
              <span class="block text-sm font-semibold text-gray-700 mb-4">Ubicación de Instalación *</span>
              <MapaUbicacion
                onLocationChange={handleLocationChange}
                initialLat={formData.latitude}
                initialLng={formData.longitude}
                height="450px"
              />
            </div>

            <!-- Dirección (solo lectura, la llena el mapa) -->
            <div>
              <label for="cot-address" class="block text-sm font-semibold text-gray-700 mb-2">Dirección Detectada</label>
              <input
                id="cot-address"
                type="text"
                name="address"
                value={formData.address}
                readonly
                class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="La dirección se detectará automáticamente al seleccionar en el mapa"
              />
              <p class="text-xs text-gray-500 mt-1">
                Si la dirección no es correcta, puedes mover el marcador en el mapa para ajustarla.
              </p>
            </div>

            <div>
              <label for="cot-description" class="block text-sm font-semibold text-gray-700 mb-2">
                Información Adicional (Opcional)
              </label>
              <textarea
                id="cot-description"
                name="description"
                bind:value={formData.description}
                rows={4}
                class="{campo} resize-y"
                placeholder="Puedes agregar cualquier detalle que consideres importante: tipo de instalación deseada, necesidades específicas, horarios de uso de electrodomésticos, restricciones del techo, presupuesto aproximado, dudas particulares, etc. Esta información nos ayudará a personalizar mejor tu cotización."
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">
                Este campo es completamente opcional. Puedes escribir cualquier cosa que consideres relevante para tu proyecto solar.
              </p>
            </div>

            <div class="flex justify-between">
              <button onclick={prevStep} class={botonAnterior}>Anterior</button>
              <button
                onclick={nextStep}
                disabled={!formData.name || !formData.email || !formData.phone || !formData.address || isSubmitting}
                class={botonSiguiente}
              >
                {#if isSubmitting}
                  <Loader2 class="w-5 h-5 animate-spin" />
                  Enviando...
                {:else}
                  Enviar Cotización <ArrowRight class="w-5 h-5" />
                {/if}
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Paso 4: Enviado -->
      {#if step === 4 && isSubmitted}
        <div class="space-y-8">
          <div class="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
            <div class="text-center mb-8">
              <div class="bg-gradient-to-br from-green-400 to-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle class="w-12 h-12 text-white" />
              </div>
              <h2 class="text-3xl lg:text-4xl font-bold text-primary mb-4">¡Cotización Enviada Exitosamente! 🎉</h2>
              <p class="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Hemos recibido tu solicitud de cotización solar. Nuestro equipo técnico especializado la revisará y se pondrá en contacto contigo pronto.
              </p>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 mb-8">
              <div class="grid md:grid-cols-2 gap-8">
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-primary">Revisión Técnica</h3>
                      <p class="text-sm text-gray-600">Analizaremos tus requerimientos energéticos</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-primary">Evaluación del Sitio</h3>
                      <p class="text-sm text-gray-600">Visitaremos tu ubicación para evaluar las condiciones</p>
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center gap-3">
                    <div class="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-primary">Propuesta Personalizada</h3>
                      <p class="text-sm text-gray-600">Diseñaremos el sistema solar perfecto para ti</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-sm">4</span>
                    </div>
                    <div>
                      <h3 class="font-semibold text-primary">Contacto Directo</h3>
                      <p class="text-sm text-gray-600">Te contactaremos para coordinar los próximos pasos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div class="flex items-start gap-3">
                <Sun class="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 class="font-semibold text-yellow-800 mb-2">¿Qué puedes esperar?</h3>
                  <ul class="text-sm text-yellow-700 space-y-1">
                    <li>• Contacto de nuestro equipo en las próximas 24-48 horas</li>
                    <li>• Propuesta técnica y económica detallada</li>
                    <li>• Asesoramiento personalizado sin compromiso</li>
                    <li>• Respuesta a todas tus dudas sobre energía solar</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="text-center space-y-6">
              <div class="bg-gray-50 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-primary mb-3">Información de Contacto</h3>
                <div class="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div><strong>Cliente:</strong> {formData.name}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Teléfono:</strong> {formData.phone}</div>
                  <div><strong>Ubicación:</strong> {formData.address.split(",")[0]}</div>
                </div>
              </div>

              <button
                onclick={resetQuote}
                class="px-8 py-4 bg-[#012928] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
              >
                Hacer Nueva Cotización
              </button>
            </div>
          </div>
        </div>
      {/if}

      <!-- Error al enviar -->
      {#if step === 3 && submitStatus?.type === "error"}
        <div class="bg-red-50 border border-[#AFEB17]/20 rounded-2xl p-6 mt-6">
          <div class="flex items-start gap-3">
            <div class="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-red-600 font-bold text-sm">!</span>
            </div>
            <div>
              <h3 class="font-semibold text-red-800 mb-2">Error al enviar la cotización</h3>
              <p class="text-sm text-red-700">{submitStatus.message}</p>
              <button
                onclick={() => (submitStatus = null)}
                class="mt-3 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
              >
                Intentar nuevamente
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
