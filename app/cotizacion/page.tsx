"use client"

import { useState, useCallback } from "react"
import { Calculator, Zap, Home, DollarSign, CheckCircle, ArrowRight, Sun, Battery, Shield, Loader2 } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"
import { clientCotizacionService } from "@/services/api/clientCotizacionService"
import { CotizacionData } from "@/services/domain/interfaces/cotizacionInterfaces"

// Dynamic import for the map component to avoid SSR issues
const LocationMapPicker = dynamic(() => import("@/components/LocationMapPicker"), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Cargando mapa...</div>
})

export default function QuotationPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    homeType: '',
    roofType: '',
    monthlyBill: '',
    familySize: '',
    appliances: [],
    applianceQuantities: {},
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    latitude: 23.1136, // Havana, Cuba default coordinates
    longitude: -82.3666
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleApplianceChange = (appliance) => {
    setFormData(prev => ({
      ...prev,
      appliances: prev.appliances.includes(appliance)
        ? prev.appliances.filter(a => a !== appliance)
        : [...prev.appliances, appliance],
      applianceQuantities: prev.appliances.includes(appliance)
        ? { ...prev.applianceQuantities, [appliance]: undefined }
        : { ...prev.applianceQuantities, [appliance]: 1 }
    }))
  }

  const handleQuantityChange = (appliance, quantity) => {
    setFormData(prev => ({
      ...prev,
      applianceQuantities: {
        ...prev.applianceQuantities,
        [appliance]: parseInt(quantity) || 1
      }
    }))
  }

  const submitQuotation = async () => {
    setIsSubmitting(true)
    setSubmitStatus(null)
    
    try {
      // Transformar datos del formulario al formato esperado
      const electrodomesticosSeleccionados = formData.appliances.map(applianceName => {
        const appliance = appliances.find(a => a.name === applianceName)
        const cantidad = formData.applianceQuantities[applianceName] || 1
        const potencia = appliance?.potencia || 0
        const horasUso = appliance?.horasUso || 0
        const consumoDiario = (potencia * horasUso * cantidad) / 1000 // kWh
        
        return {
          nombre: applianceName,
          cantidad,
          potencia,
          horasUso,
          consumoDiario
        }
      })

      const consumoTotalDiario = electrodomesticosSeleccionados.reduce(
        (total, electro) => total + electro.consumoDiario, 0
      )
      
      const potenciaRequerida = consumoTotalDiario * 1.3 // Factor de seguridad

      // Separar dirección en municipio/provincia (simplificado)
      const direccionParts = formData.address.split(', ')
      const municipio = direccionParts.length > 1 ? direccionParts[direccionParts.length - 2] : 'No especificado'
      const provincia = direccionParts.length > 0 ? direccionParts[direccionParts.length - 1] : 'No especificado'

      const cotizacionData: CotizacionData = {
        nombre: formData.name,
        telefono: formData.phone,
        email: formData.email,
        direccion: formData.address,
        municipio,
        provincia,
        consumoMensual: parseInt(formData.monthlyBill) * 30 || 0, // Estimación kWh mensual
        tipoInstalacion: formData.homeType === 'Casa' ? 'residencial' : 
                        formData.homeType === 'Local Comercial' ? 'comercial' : 'residencial',
        electrodomesticos: electrodomesticosSeleccionados,
        consumoTotalDiario,
        potenciaRequerida,
        comentarios: formData.description || '',
        fechaSolicitud: new Date().toISOString(),
        latitude: formData.latitude,
        longitude: formData.longitude
      }
      
      const response = await clientCotizacionService.enviarCotizacion(cotizacionData)
      
      if (response.success) {
        setIsSubmitted(true)
        setStep(4)
      } else {
        setSubmitStatus({ type: 'error', message: response.message || 'Error al enviar la cotización' })
      }
    } catch (error) {
      console.error('Error enviando cotización:', error)
      setSubmitStatus({ 
        type: 'error', 
        message: 'Error de conexión. Por favor, intenta nuevamente.' 
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      submitQuotation()
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleLocationChange = useCallback((lat, lng, address) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address
    }))
  }, [])

  const resetQuote = () => {
    setStep(1)
    setIsSubmitted(false)
    setSubmitStatus(null)
    setFormData({
      homeType: '',
      roofType: '',
      monthlyBill: '',
      familySize: '',
      appliances: [],
      applianceQuantities: {},
      name: '',
      email: '',
      phone: '',
      address: '',
      description: '',
      latitude: 23.1136,
      longitude: -82.3666
    })
  }

  const appliances = [
    { name: 'Aire Acondicionado', icon: '❄️', potencia: 2500, horasUso: 8 },
    { name: 'Refrigerador', icon: '🧊', potencia: 150, horasUso: 24 },
    { name: 'Lavadora', icon: '👕', potencia: 500, horasUso: 2 },
    { name: 'Televisor', icon: '📺', potencia: 100, horasUso: 6 },
    { name: 'Computadora', icon: '💻', potencia: 300, horasUso: 8 },
    { name: 'Microondas', icon: '🍽️', potencia: 1200, horasUso: 1 },
    { name: 'Plancha', icon: '👔', potencia: 1500, horasUso: 1 },
    { name: 'Bomba de Agua', icon: '💧', potencia: 750, horasUso: 2 }
  ]


  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-br from-primary to-blue-800 overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center text-white space-y-6" style={{ marginTop: '100px' }}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block animate-fade-in-up">Calcula Tu</span>
              <span className="block bg-secondary-gradient bg-clip-text text-transparent animate-fade-in-up animation-delay-200">
                Sistema Solar Ideal
              </span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-400">
              Obtén una cotización personalizada en minutos y descubre cuánto puedes ahorrar con energía solar
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-white/20 rounded-full animate-bounce animation-delay-1200"></div>
        <div className="absolute bottom-40 left-20 w-1 h-1 bg-white/40 rounded-full animate-bounce animation-delay-800"></div>
      </section>

      {/* Progress Bar */}
      <div className="bg-gray-50 py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                    step >= stepNumber 
                      ? 'bg-secondary-gradient text-white' 
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {stepNumber === 4 && isSubmitted ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-16 sm:w-24 h-1 mx-2 ${
                      step > stepNumber ? 'bg-secondary-gradient' : 'bg-gray-300'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs sm:text-sm font-medium text-gray-600">
              <span>Hogar</span>
              <span>Consumo</span>
              <span>Contacto</span>
              <span>Enviado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote Form */}
      <section className="py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Step 1: Home Information */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                <div className="text-center mb-8">
                  <Home className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                    Información de tu Hogar
                  </h2>
                  <p className="text-gray-600">
                    Cuéntanos sobre tu propiedad para personalizar tu cotización
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo de Vivienda
                    </label>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {['Casa', 'Apartamento', 'Local Comercial', 'Otro'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, homeType: type }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            formData.homeType === type
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-300 hover:border-primary/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tipo de Techo
                    </label>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {['Hormigón', 'Tejas', 'Zinc'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, roofType: type }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            formData.roofType === type
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-300 hover:border-primary/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={nextStep}
                      disabled={!formData.homeType || !formData.roofType}
                      className="px-8 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      Siguiente <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Energy Consumption */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                <div className="text-center mb-8">
                  <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                    Consumo Energético
                  </h2>
                  <p className="text-gray-600">
                    Ayúdanos a dimensionar tu sistema solar perfecto
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Factura Eléctrica Mensual (USD)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {['50-100', '100-200', '200-300', '300+'].map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, monthlyBill: range.split('-')[0] }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            formData.monthlyBill === range.split('-')[0]
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-300 hover:border-primary/50'
                          }`}
                        >
                          ${range}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Personas en el Hogar
                    </label>
                    <div className="grid grid-cols-4 gap-4">
                      {['1-2', '3-4', '5-6', '7+'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, familySize: size.split('-')[0] }))}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            formData.familySize === size.split('-')[0]
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-gray-300 hover:border-primary/50'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Electrodomésticos Principales (selecciona los que tienes)
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">💡 Información importante:</span> La selección de electrodomésticos es <strong>opcional</strong> y nos ayuda a entender mejor tus necesidades energéticas para diseñar un sistema personalizado.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {appliances.map((appliance) => (
                        <div key={appliance.name} className="space-y-2">
                          <button
                            type="button"
                            onClick={() => handleApplianceChange(appliance.name)}
                            className={`w-full p-4 rounded-lg border-2 transition-all duration-300 text-center ${
                              formData.appliances.includes(appliance.name)
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-gray-300 hover:border-primary/50'
                            }`}
                          >
                            <div className="text-2xl mb-2">{appliance.icon}</div>
                            <div className="text-xs font-medium">{appliance.name}</div>
                          </button>
                          {formData.appliances.includes(appliance.name) && (
                            <div className="flex items-center gap-2 px-2">
                              <label className="text-xs text-gray-600 font-medium">Cantidad:</label>
                              <select
                                value={formData.applianceQuantities[appliance.name] || 1}
                                onChange={(e) => handleQuantityChange(appliance.name, e.target.value)}
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:border-transparent"
                              >
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.monthlyBill || !formData.familySize}
                      className="px-8 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      Siguiente <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact Information */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                <div className="text-center mb-8">
                  <Calculator className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                    Información de Contacto y Ubicación
                  </h2>
                  <p className="text-gray-600">
                    Para que nuestro equipo técnico pueda contactarte y diseñar tu sistema solar personalizado
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                        placeholder="+53 5 xxx-xxxx"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                      placeholder="tu@email.com"
                    />
                  </div>

                  {/* Location Section with Map */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Ubicación de Instalación *
                    </label>
                    <LocationMapPicker
                      onLocationChange={handleLocationChange}
                      initialLat={formData.latitude}
                      initialLng={formData.longitude}
                      height="450px"
                    />
                  </div>

                  {/* Address text field (now read-only, filled by map) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dirección Detectada
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                      placeholder="La dirección se detectará automáticamente al seleccionar en el mapa"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si la dirección no es correcta, puedes mover el marcador en el mapa para ajustarla.
                    </p>
                  </div>

                  {/* Optional description field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Información Adicional (Opcional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 resize-vertical"
                      placeholder="Puedes agregar cualquier detalle que consideres importante: tipo de instalación deseada, necesidades específicas, horarios de uso de electrodomésticos, restricciones del techo, presupuesto aproximado, dudas particulares, etc. Esta información nos ayudará a personalizar mejor tu cotización."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Este campo es completamente opcional. Puedes escribir cualquier cosa que consideres relevante para tu proyecto solar.
                    </p>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.name || !formData.email || !formData.phone || !formData.address || isSubmitting}
                      className="px-8 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          Enviar Cotización <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Success Message */}
            {step === 4 && isSubmitted && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-bold text-primary mb-4">
                      ¡Cotización Enviada Exitosamente! 🎉
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Hemos recibido tu solicitud de cotización solar. Nuestro equipo técnico especializado la revisará y se pondrá en contacto contigo pronto.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 mb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">1</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary">Revisión Técnica</h3>
                            <p className="text-sm text-gray-600">Analizaremos tus requerimientos energéticos</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">2</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary">Evaluación del Sitio</h3>
                            <p className="text-sm text-gray-600">Visitaremos tu ubicación para evaluar las condiciones</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">3</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary">Propuesta Personalizada</h3>
                            <p className="text-sm text-gray-600">Diseñaremos el sistema solar perfecto para ti</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">4</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-primary">Contacto Directo</h3>
                            <p className="text-sm text-gray-600">Te contactaremos para coordinar los próximos pasos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
                    <div className="flex items-start gap-3">
                      <Sun className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-yellow-800 mb-2">¿Qué puedes esperar?</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Contacto de nuestro equipo en las próximas 24-48 horas</li>
                          <li>• Propuesta técnica y económica detallada</li>
                          <li>• Asesoramiento personalizado sin compromiso</li>
                          <li>• Respuesta a todas tus dudas sobre energía solar</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-primary mb-3">Información de Contacto</h3>
                      <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <strong>Cliente:</strong> {formData.name}
                        </div>
                        <div>
                          <strong>Email:</strong> {formData.email}
                        </div>
                        <div>
                          <strong>Teléfono:</strong> {formData.phone}
                        </div>
                        <div>
                          <strong>Ubicación:</strong> {formData.address.split(',')[0]}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={resetQuote}
                      className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 mx-auto"
                    >
                      Hacer Nueva Cotización
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {step === 3 && submitStatus?.type === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-red-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold text-sm">!</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 mb-2">Error al enviar la cotización</h3>
                    <p className="text-sm text-red-700">{submitStatus.message}</p>
                    <button 
                      onClick={() => setSubmitStatus(null)}
                      className="mt-3 px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Intentar nuevamente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-secondary-gradient text-white text-sm font-semibold rounded-full mb-4">
              Beneficios
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4">
              ¿Por Qué Elegir Energía Solar?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Ahorro Inmediato",
                description: "Reduce tu factura eléctrica hasta un 90% desde el primer mes"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Energía 24/7",
                description: "Sistema con baterías para tener electricidad durante apagones"
              },
              {
                icon: <Sun className="w-8 h-8" />,
                title: "Energía Limpia",
                description: "Contribuye al medio ambiente con energía 100% renovable"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition-all duration-300">
                <div className="bg-secondary-gradient p-4 rounded-full w-16 h-16 mx-auto mb-6 text-white flex items-center justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-primary mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}