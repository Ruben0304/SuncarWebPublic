"use client"

import { useState, useCallback } from "react"
import { Calculator, Zap, Home, DollarSign, CheckCircle, ArrowRight, Sun, Battery, Shield } from "lucide-react"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"

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
    latitude: 23.1136, // Havana, Cuba default coordinates
    longitude: -82.3666
  })
  const [quote, setQuote] = useState(null)

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

  const calculateQuote = () => {
    const basePrice = 8000
    const billMultiplier = parseInt(formData.monthlyBill) || 100
    const familyMultiplier = parseInt(formData.familySize) || 4
    
    // Calculate appliance multiplier based on quantities
    const applianceMultiplier = formData.appliances.reduce((total, appliance) => {
      const quantity = formData.applianceQuantities[appliance] || 1
      return total + (quantity * 500)
    }, 0)
    
    const systemPrice = basePrice + (billMultiplier * 80) + (familyMultiplier * 1200) + applianceMultiplier
    const monthlySavings = billMultiplier * 0.8
    const yearlySavings = monthlySavings * 12
    const paybackYears = Math.round(systemPrice / yearlySavings)

    setQuote({
      systemPrice,
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(yearlySavings),
      paybackYears,
      systemSize: Math.round((systemPrice / 2000) * 100) / 100,
      panels: Math.ceil(systemPrice / 400)
    })
    setStep(4)
  }

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      calculateQuote()
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
    setQuote(null)
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
      latitude: 23.1136,
      longitude: -82.3666
    })
  }

  const appliances = [
    { name: 'Aire Acondicionado', icon: '❄️' },
    { name: 'Refrigerador', icon: '🧊' },
    { name: 'Lavadora', icon: '👕' },
    { name: 'Televisor', icon: '📺' },
    { name: 'Computadora', icon: '💻' },
    { name: 'Microondas', icon: '🍽️' },
    { name: 'Plancha', icon: '👔' },
    { name: 'Bomba de Agua', icon: '💧' }
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
                    {stepNumber === 4 && quote ? <CheckCircle className="w-5 h-5" /> : stepNumber}
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
              <span>Cotización</span>
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
                    Para enviarte tu cotización personalizada y calcular la mejor instalación
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

                  <div className="flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!formData.name || !formData.email || !formData.phone || !formData.address}
                      className="px-8 py-3 bg-secondary-gradient text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      Calcular Cotización <Calculator className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Quote Results */}
            {step === 4 && quote && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
                  <div className="text-center mb-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-4">
                      ¡Tu Cotización Está Lista!
                    </h2>
                    <p className="text-gray-600">
                      Basado en tu información, este es tu sistema solar personalizado
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white text-center">
                      <Sun className="w-8 h-8 mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">{quote.systemSize} kW</div>
                      <div className="text-sm opacity-90">Capacidad del Sistema</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
                      <DollarSign className="w-8 h-8 mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">${quote.monthlySavings}</div>
                      <div className="text-sm opacity-90">Ahorro Mensual</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white text-center">
                      <Battery className="w-8 h-8 mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">{quote.panels}</div>
                      <div className="text-sm opacity-90">Paneles Solares</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white text-center">
                      <Shield className="w-8 h-8 mx-auto mb-3" />
                      <div className="text-2xl font-bold mb-1">{quote.paybackYears} años</div>
                      <div className="text-sm opacity-90">Período de Retorno</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-primary mb-6">Resumen de Inversión</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Costo del Sistema:</span>
                        <span className="text-2xl font-bold text-primary">${quote.systemPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ahorro Mensual:</span>
                        <span className="text-xl font-semibold text-green-600">${quote.monthlySavings}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Ahorro Anual:</span>
                        <span className="text-xl font-semibold text-green-600">${quote.yearlySavings.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Ahorro en 25 años:</span>
                          <span className="text-2xl font-bold text-green-600">${(quote.yearlySavings * 25).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <p className="text-gray-600 mb-6">
                      Esta cotización es aproximada. Un especialista se contactará contigo para una evaluación detallada.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="px-8 py-4 bg-secondary-gradient text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        Confirmar Interés
                      </button>
                      <button 
                        onClick={resetQuote}
                        className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        Nueva Cotización
                      </button>
                    </div>
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