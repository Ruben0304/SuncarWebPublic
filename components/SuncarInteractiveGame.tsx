"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Lightbulb, 
  Battery, 
  Sun, 
  Wrench, 
  Zap, 
  Search,
  Hammer,
  Shield,
  ChevronRight,
  PlayCircle,
  RotateCcw,
  Star,
  Trophy,
  Target,
  Clock,
  Home,
  CheckCircle,
  XCircle,
  Coins,
  Award,
  Move,
  MousePointer2,
  Sparkles,
  Flame,
  Settings,
  Gauge,
  Cable,
  ScanLine,
  Calculator,
  ThermometerSun,
  Zap as Lightning,
  Crown
} from 'lucide-react'

interface GameChoice {
  id: string
  text: string
  points: number
  consequence: string
  isCorrect: boolean
}

interface GameStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  question: string
  choices: GameChoice[]
  successMessage: string
  tips: string[]
}

type GameState = 'intro' | 'playing' | 'showingResult' | 'completed' | 'minigame'

interface DragItem {
  id: string
  name: string
  type: 'panel' | 'battery' | 'cable' | 'inverter' | 'meter'
  icon: React.ReactNode
  description: string
}

interface DropZone {
  id: string
  name: string
  acceptedTypes: string[]
  position: { x: number; y: number }
  description: string
  isCorrect: boolean
}

export default function SuncarInteractiveGame() {
  const [gameState, setGameState] = useState<GameState>('intro')
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [blackoutTimer, setBlackoutTimer] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<string[]>([])
  const [currentChoice, setCurrentChoice] = useState<GameChoice | null>(null)
  const [animateScore, setAnimateScore] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [showSparks, setShowSparks] = useState(false)
  const [cinematicEffect, setCinematicEffect] = useState(false)
  const [dragItems, setDragItems] = useState<DragItem[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [placedItems, setPlacedItems] = useState<{[key: string]: string}>({})
  const [minigameScore, setMinigameScore] = useState(0)

  const gameSteps: GameStep[] = [
    {
      id: 'study',
      title: 'Estudio GRATUITO',
      description: '¡Un experto de Suncar visita tu hogar SIN COSTO para diseñar tu sistema anti-apagones!',
      icon: <Search className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      question: '¿Cuántas horas al día tendrás electricidad GARANTIZADA con un sistema solar Suncar de 5kW + baterías?',
      choices: [
        {
          id: 'fullday',
          text: '⚡ 24 horas completas (energía independiente total)',
          points: 100,
          consequence: '¡Correcto! Con paneles solares + baterías inteligentes, tu hogar funciona las 24 horas sin depender de la red eléctrica. ¡Olvídate para siempre de los apagones!',
          isCorrect: true
        },
        {
          id: 'partial',
          text: '⚡ Solo cuando hay sol (8-12 horas diarias)',
          points: 60,
          consequence: 'Los paneles solos solo funcionan de día, pero con nuestras baterías almacenas energía para toda la noche. ¡Tendrás electricidad 24/7!',
          isCorrect: false
        },
        {
          id: 'minimal',
          text: '⚡ Solo algunas horas (energía limitada)',
          points: 20,
          consequence: '¡Nuestros sistemas están diseñados para darte libertad total! Con el dimensionamiento correcto, nunca te quedarás sin electricidad.',
          isCorrect: false
        }
      ],
      successMessage: '¡Perfecto! Entiendes que con Suncar tendrás energía INDEPENDIENTE las 24 horas. Un estudio gratuito calculará el sistema exacto para tu hogar.',
      tips: [
        '¡Evaluación 100% GRATUITA de tu hogar!',
        'Sistema anti-apagones personalizado para TU hogar',
        'Cálculo de horas de autonomía durante cortes eléctricos',
        'Plan de financiamiento personalizado disponible'
      ]
    },
    {
      id: 'installation',
      title: 'Instalación EXPRESS',
      description: '¡En solo 48 horas tu hogar tendrá energía independiente! Técnicos expertos garantizados.',
      icon: <Hammer className="w-8 h-8" />,
      color: 'from-orange-500 to-orange-600',
      question: '¿En cuánto tiempo un sistema solar SE PAGA SOLO en Cuba con los precios actuales de electricidad?',
      choices: [
        {
          id: 'payback3',
          text: '⚡ 3-4 años (retorno rápido con ahorros garantizados)',
          points: 100,
          consequence: '¡Correcto! Con los altos precios de la electricidad en Cuba, tu inversión se recupera rápidamente. Después de 4 años, ¡toda la energía es GRATIS por 20+ años más!',
          isCorrect: true
        },
        {
          id: 'payback10',
          text: '⚡ 10 años (retorno a largo plazo)',
          points: 40,
          consequence: 'En otros países quizás, pero en Cuba con nuestros precios altos de electricidad, tu retorno es mucho más rápido. ¡Empiezas a ahorrar desde el día 1!',
          isCorrect: false
        },
        {
          id: 'payback20',
          text: '⚡ 20 años (inversión a muy largo plazo)',
          points: 10,
          consequence: '¡Nada que ver! Con los constantes aumentos de tarifas eléctricas en Cuba, tu sistema se paga en menos de 5 años. Es la mejor inversión para tu familia.',
          isCorrect: false
        }
      ],
      successMessage: '¡Fantástico! Ahora entiendes por qué la energía solar es la MEJOR INVERSIÓN para tu familia en Cuba.',
      tips: [
        'Instalación rápida: tu sistema funciona en 48h',
        'Técnicos certificados con +1000 instalaciones',
        'Paneles de última generación con 25 años de garantía',
        'Financiamiento hasta 60 meses sin intereses'
      ]
    },
    {
      id: 'maintenance',
      title: 'Tranquilidad TOTAL',
      description: '6 meses después... ¡Disfrutas de electricidad 24/7 sin preocuparte por los apagones!',
      icon: <Wrench className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      question: '¿Cuál es el MAYOR BENEFICIO de tener energía solar durante los apagones en Cuba?',
      choices: [
        {
          id: 'independence',
          text: '🏠 LIBERTAD TOTAL: tu hogar funciona normal durante cualquier apagón',
          points: 100,
          consequence: '¡Exacto! Durante los apagones, tú mantienes aire acondicionado, nevera funcionando, y toda tu familia cómoda. ¡Es el regalo más valioso que puedes dar a tu familia!',
          isCorrect: true
        },
        {
          id: 'save_money',
          text: '💰 Solo ahorrar dinero en la factura eléctrica',
          points: 60,
          consequence: 'El ahorro es genial, pero lo más valioso es la TRANQUILIDAD. No más comida dañada, no más calor agobiante, no más interrupciones. ¡Es calidad de vida!',
          isCorrect: false
        },
        {
          id: 'environment',
          text: '🌱 Ayudar al medio ambiente únicamente',
          points: 40,
          consequence: 'Cuidar el planeta es importante, pero para tu familia lo crucial es tener electricidad 24/7. ¡No más sufrimiento por apagones!',
          isCorrect: false
        }
      ],
      successMessage: '¡Magnífico! Comprendes el valor de tener energía INDEPENDIENTE durante los apagones. ¡Tu familia se lo merece!',
      tips: [
        'Mantenimiento mínimo: solo limpieza ocasional',
        'Soporte técnico WhatsApp 24/7 para tu tranquilidad',
        'App móvil para ver tus ahorros en tiempo real',
        'Garantía total: reemplazamos cualquier componente'
      ]
    }
  ]

  const handleChoiceSelect = useCallback((choice: GameChoice) => {
    setSelectedChoice(choice.id)
    setCurrentChoice(choice)
    
    // Cinematic effects
    setCinematicEffect(true)
    setTimeout(() => setCinematicEffect(false), 2000)
    
    if (choice.isCorrect) {
      setShowExplosion(true)
      setTimeout(() => setShowExplosion(false), 1500)
    } else {
      setShowSparks(true)
      setTimeout(() => setShowSparks(false), 1000)
    }
    
    setTimeout(() => {
      setGameState('showingResult')
      
      // Add points with animation
      setAnimateScore(true)
      setTimeout(() => {
        setScore(prev => prev + choice.points)
        setAnimateScore(false)
      }, 500)
      
      // Add achievements
      if (choice.isCorrect && choice.points === 100) {
        const newAchievement = `Experto en ${gameSteps[currentStep].title}`
        setAchievements(prev => [...prev, newAchievement])
      }
    }, 1000)
  }, [currentStep])

  const nextStep = useCallback(() => {
    setCompletedSteps(prev => [...prev, currentStep])
    setSelectedChoice(null)
    setCurrentChoice(null)
    
    if (currentStep < gameSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setGameState('playing')
    } else {
      setGameState('minigame')
      initializeMinigame()
    }
  }, [currentStep])

  const initializeMinigame = useCallback(() => {
    const items: DragItem[] = [
      {
        id: 'panel',
        name: 'Panel Solar',
        type: 'panel',
        icon: <Sun className="w-6 h-6" />,
        description: 'Convierte luz solar en electricidad'
      },
      {
        id: 'battery',
        name: 'Batería',
        type: 'battery',
        icon: <Battery className="w-6 h-6" />,
        description: 'Almacena energía para la noche'
      },
      {
        id: 'inverter',
        name: 'Inversor',
        type: 'inverter',
        icon: <Settings className="w-6 h-6" />,
        description: 'Convierte DC a AC'
      },
      {
        id: 'cable',
        name: 'Cable DC',
        type: 'cable',
        icon: <Cable className="w-6 h-6" />,
        description: 'Conecta componentes'
      },
      {
        id: 'meter',
        name: 'Medidor',
        type: 'meter',
        icon: <Gauge className="w-6 h-6" />,
        description: 'Mide la producción'
      }
    ]
    setDragItems(items)
    setPlacedItems({})
    setMinigameScore(0)
  }, [])

  const dropZones: DropZone[] = [
    {
      id: 'roof',
      name: 'Techo',
      acceptedTypes: ['panel'],
      position: { x: 20, y: 10 },
      description: 'Los paneles van en el techo',
      isCorrect: false
    },
    {
      id: 'wall',
      name: 'Pared Exterior',
      acceptedTypes: ['battery', 'inverter'],
      position: { x: 60, y: 30 },
      description: 'Baterías e inversor van protegidos',
      isCorrect: false
    },
    {
      id: 'connection',
      name: 'Conexiones',
      acceptedTypes: ['cable'],
      position: { x: 40, y: 20 },
      description: 'Los cables conectan todo',
      isCorrect: false
    },
    {
      id: 'panel-area',
      name: 'Panel de Monitoreo',
      acceptedTypes: ['meter'],
      position: { x: 70, y: 60 },
      description: 'Medidor para monitorear',
      isCorrect: false
    }
  ]

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId)
  }

  const handleDrop = (zoneId: string) => {
    if (!draggedItem) return
    
    const item = dragItems.find(i => i.id === draggedItem)
    const zone = dropZones.find(z => z.id === zoneId)
    
    if (item && zone && zone.acceptedTypes.includes(item.type)) {
      setPlacedItems(prev => ({ ...prev, [zoneId]: draggedItem }))
      setMinigameScore(prev => prev + 50)
      setShowSparks(true)
      setTimeout(() => setShowSparks(false), 1000)
    }
    
    setDraggedItem(null)
  }

  const completeMinigame = () => {
    setGameState('completed')
    setScore(prev => prev + minigameScore)
  }

  useEffect(() => {
    // Solo ejecutar el timer si el componente está montado y el juego está activo
    if (gameState !== 'intro') {
      const blackoutInterval = setInterval(() => {
        setBlackoutTimer(prev => prev + 1)
      }, 1000)

      return () => clearInterval(blackoutInterval)
    }
  }, [gameState])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startGame = useCallback(() => {
    setGameState('playing')
    setCurrentStep(0)
    setCompletedSteps([])
    setScore(0)
    setSelectedChoice(null)
    setAchievements([])
    setCurrentChoice(null)
  }, [])

  const resetGame = useCallback(() => {
    setGameState('intro')
    setCurrentStep(0)
    setCompletedSteps([])
    setScore(0)
    setSelectedChoice(null)
    setAchievements([])
    setCurrentChoice(null)
  }, [])

  return (
    <section className={`py-16 lg:py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden transition-all duration-1000 ${
      cinematicEffect ? 'brightness-150 contrast-125' : ''
    }`}>
      {/* Cinematic Effects */}
      {showExplosion && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 bg-gradient-radial from-yellow-300 via-orange-400 to-transparent rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 w-96 h-96 bg-gradient-radial from-white via-yellow-200 to-transparent rounded-full animate-pulse"></div>
          </div>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 100}ms`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          ))}
        </div>
      )}
      
      {showSparks && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                top: `${30 + Math.random() * 40}%`,
                left: `${30 + Math.random() * 40}%`,
                animationDelay: `${i * 150}ms`
              }}
            >
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
          ))}
        </div>
      )}

      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-40">
        {/* Floating icons */}
        <div className="absolute top-32 right-20 animate-bounce animation-delay-1000">
          <Sun className="w-6 h-6 text-yellow-400/40" />
        </div>
        <div className="absolute bottom-32 left-20 animate-bounce animation-delay-1500">
          <Battery className="w-6 h-6 text-green-400/40" />
        </div>
        <div className="absolute top-1/2 right-1/4 animate-bounce animation-delay-500">
          <Zap className="w-6 h-6 text-blue-400/40" />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            La Solución de Suncar
            <span className="block bg-gradient-to-r from-[#FDB813] to-[#F26729] bg-clip-text text-transparent">
              Contra los Apagones
            </span>
          </h2>
          <p className="text-lg text-blue-100/90 max-w-3xl mx-auto mb-8">
            ¡Nunca más sufras por los apagones! Con Suncar mantienes tu hogar funcionando 
            las 24 horas del día con energía solar independiente. ¡Descubre cómo combatir 
            definitivamente los cortes de electricidad!
          </p>
        </div>

        {/* Game Interface */}
        <div className="max-w-6xl mx-auto">

          {/* Score Display */}
          {(gameState === 'playing' || gameState === 'showingResult') && (
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className={`bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20 transition-all duration-500 ${
                animateScore ? 'scale-110 bg-yellow-400/20' : ''
              }`}>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#FDB813]" />
                  <span className="text-white font-bold text-lg">{score} puntos</span>
                </div>
              </div>
              
              {achievements.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-purple-400/30">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[#FDB813]" />
                    <span className="text-white font-semibold">{achievements.length} logros</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === 'intro' && (
            <div className="mb-16 lg:mb-20">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content Section */}
                <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">
                  <div>
                    <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                      🎮 ¡Descubre Cómo 
                      <span className="block bg-gradient-to-r from-[#FDB813] to-[#F26729] bg-clip-text text-transparent">
                        VENCER los Apagones!
                      </span>
                    </h3>
                    <p className="text-blue-100/90 mb-8 text-lg lg:text-xl leading-relaxed">
                      Toma decisiones inteligentes y descubre cómo Suncar puede darte independencia energética total contra los cortes eléctricos.
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                      <div className="text-center">
                        <Target className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                        <div className="text-sm text-white font-semibold">3 Desafíos</div>
                      </div>
                      <div className="text-center">
                        <Trophy className="w-10 h-10 text-[#FDB813] mx-auto mb-3" />
                        <div className="text-sm text-white font-semibold">Logros</div>
                      </div>
                      <div className="text-center">
                        <Star className="w-10 h-10 text-green-400 mx-auto mb-3" />
                        <div className="text-sm text-white font-semibold">Puntos</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    href="/solar-survivor"
                    className="group px-10 py-5 bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-xl flex items-center gap-4 mx-auto lg:mx-0"
                  >
                    <PlayCircle className="w-7 h-7 group-hover:animate-spin" />
                    ¡Empezar el Juego!
                    <ChevronRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Game Logo Section */}
                <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                  <div className="relative">
                    {/* Floating animation container */}
                    <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem]">
                      <Image 
                        src="/images/logo-juego.png" 
                        alt="Logo del Juego Suncar" 
                        fill
                        className="object-contain animate-float drop-shadow-2xl"
                        priority
                      />
                    </div>
                    
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F26729]/20 to-[#FDB813]/20 rounded-full blur-3xl scale-75 animate-pulse"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute top-1/4 -right-8 w-3 h-3 bg-[#FDB813] rounded-full animate-bounce opacity-70"></div>
                    <div className="absolute bottom-1/4 -left-8 w-2 h-2 bg-[#F26729] rounded-full animate-bounce animation-delay-1000 opacity-60"></div>
                    <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500 opacity-50"></div>
                    <div className="absolute bottom-1/3 left-4 w-1.5 h-1.5 bg-white rounded-full animate-pulse animation-delay-1500 opacity-60"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Steps - Only show when playing */}
          {(gameState === 'playing' || gameState === 'showingResult') && (
            <div className="flex justify-center items-center mb-12">
              <div className="flex items-center space-x-4">
                {gameSteps.map((step, index) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 border-2
                        ${completedSteps.includes(index) 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400 text-white scale-110' 
                          : currentStep === index 
                          ? `bg-gradient-to-r ${step.color} border-white text-white scale-125 animate-pulse` 
                          : 'bg-white/10 border-white/30 text-white/60'}
                      `}>
                        {completedSteps.includes(index) ? (
                          <Shield className="w-8 h-8" />
                        ) : (
                          step.icon
                        )}
                      </div>
                      <span className={`mt-2 text-sm font-semibold text-center transition-colors duration-300 ${
                        completedSteps.includes(index) ? 'text-green-400' : 
                        currentStep === index ? 'text-white' : 'text-white/60'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < gameSteps.length - 1 && (
                      <div className={`w-12 h-1 rounded transition-colors duration-500 ${
                        completedSteps.includes(index) ? 'bg-green-400' : 'bg-white/20'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Game Step */}
          {gameState === 'playing' && (
            <div className="mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    {gameSteps[currentStep].icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{gameSteps[currentStep].title}</h3>
                    <p className="text-white/90 mt-2">{gameSteps[currentStep].description}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 mb-6">
                  <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    {gameSteps[currentStep].question}
                  </h4>
                  
                  <div className="space-y-3">
                    {gameSteps[currentStep].choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoiceSelect(choice)}
                        disabled={selectedChoice !== null}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 transform hover:scale-102 ${
                          selectedChoice === choice.id
                            ? choice.isCorrect
                              ? 'bg-[#4ade80]/20 border-[#4ade80] text-white'
                              : 'bg-red-500/10 border-red-400/60 text-white'
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/40'
                        } disabled:cursor-not-allowed`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{choice.text}</span>
                          {selectedChoice === choice.id && (
                            <div className="flex items-center gap-2">
                              <Coins className="w-4 h-4 text-[#FDB813]" />
                              <span className="text-[#FDB813] font-bold">+{choice.points}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Display */}
          {gameState === 'showingResult' && currentChoice && (
            <div className="mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    {currentChoice.isCorrect ? (
                      <CheckCircle className="w-12 h-12" />
                    ) : (
                      <XCircle className="w-12 h-12" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">
                    {currentChoice.isCorrect ? '¡Excelente decisión!' : '¡Buena participación!'}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-6 h-6 text-[#FDB813]" />
                    <span className="text-xl font-bold text-[#FDB813]">+{currentChoice.points} puntos</span>
                  </div>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 mb-6">
                  <p className="text-lg text-center leading-relaxed">
                    {currentChoice.consequence}
                  </p>
                </div>
                
                <div className="text-center">
                  <button
                    onClick={nextStep}
                    className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                  >
                    {currentStep < gameSteps.length - 1 ? 'Continuar' : 'Ver Resultados'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Drag and Drop Minigame */}
          {gameState === 'minigame' && (
            <div className="mb-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white shadow-2xl border border-white/20">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                    <MousePointer2 className="w-8 h-8" />
                    ¡Construye Tu Sistema Solar!
                  </h3>
                  <p className="text-blue-100 text-lg">
                    Arrastra cada componente a su ubicación correcta en la casa
                  </p>
                  
                  <div className="bg-white/10 rounded-2xl p-4 mt-6 inline-block">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-[#FDB813]" />
                      <span className="font-bold text-[#FDB813]">{minigameScore} puntos bonus</span>
                    </div>
                  </div>
                </div>

                {/* House Layout */}
                <div className="relative bg-white/10 rounded-2xl p-8 mb-8 min-h-96">
                  <div className="absolute inset-0 bg-gradient-to-b from-sky-400/20 to-green-400/20 rounded-2xl"></div>
                  
                  {/* House SVG or visual representation */}
                  <div className="relative z-10">
                    <div className="text-center text-white/80 text-sm mb-4">🏠 Vista de la Casa</div>
                    
                    {/* Drop zones */}
                    {dropZones.map(zone => (
                      <div
                        key={zone.id}
                        className={`absolute w-24 h-24 border-2 border-dashed border-white/50 rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 ${
                          placedItems[zone.id] ? 'border-green-400 bg-green-400/20' : ''
                        }`}
                        style={{ left: `${zone.position.x}%`, top: `${zone.position.y}%` }}
                        onDrop={(e) => {
                          e.preventDefault()
                          handleDrop(zone.id)
                        }}
                        onDragOver={(e) => e.preventDefault()}
                      >
                        {placedItems[zone.id] ? (
                          <div className="text-green-400">
                            {dragItems.find(item => item.id === placedItems[zone.id])?.icon}
                            <div className="text-xs text-white mt-1">
                              {dragItems.find(item => item.id === placedItems[zone.id])?.name}
                            </div>
                          </div>
                        ) : (
                          <div className="text-white/60 text-xs text-center px-2">
                            {zone.name}
                          </div>
                        )}
                        
                        {showSparks && placedItems[zone.id] && (
                          <div className="absolute -inset-2 animate-ping">
                            <Sparkles className="w-8 h-8 text-[#FDB813]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Draggable Items */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                  {dragItems.map(item => (
                    !Object.values(placedItems).includes(item.id) && (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => handleDragStart(item.id)}
                        className={`bg-white/10 rounded-xl p-4 cursor-move hover:bg-white/20 transition-all duration-300 transform hover:scale-105 ${
                          draggedItem === item.id ? 'scale-110 bg-white/30' : ''
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-white mb-2">{item.icon}</div>
                          <div className="text-white font-semibold text-sm mb-1">{item.name}</div>
                          <div className="text-white/70 text-xs">{item.description}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Complete Minigame Button */}
                {Object.keys(placedItems).length === dropZones.length && (
                  <div className="text-center">
                    <button
                      onClick={completeMinigame}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 text-lg flex items-center gap-3 mx-auto animate-bounce"
                    >
                      <CheckCircle className="w-6 h-6" />
                      ¡Sistema Completado!
                      <Lightning className="w-6 h-6" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Final Results */}
          {gameState === 'completed' && (
            <div>
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-8">
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#FDB813] to-[#F26729] rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">
                    🎉 ¡Misión Completada!
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Coins className="w-8 h-8 text-[#FDB813] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white mb-1">{score + minigameScore}</div>
                      <div className="text-sm text-white/60">Puntos Totales</div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Trophy className="w-8 h-8 text-[#FDB813] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white mb-1">{achievements.length}</div>
                      <div className="text-sm text-white/60">Logros Desbloqueados</div>
                    </div>
                    
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <Star className="w-8 h-8 text-[#FDB813] mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {(score + minigameScore) >= 300 ? 'Maestro Solar' : (score + minigameScore) >= 250 ? 'Experto' : (score + minigameScore) >= 150 ? 'Avanzado' : 'Principiante'}
                      </div>
                      <div className="text-sm text-white/60">Nivel Solar</div>
                    </div>
                  </div>
                  
                  {(score + minigameScore) >= 300 && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                      <Crown className="w-12 h-12 text-[#FDB813] mx-auto mb-3" />
                      <h4 className="text-xl font-bold text-white mb-2">👑 ¡Maestro Solar Supremo!</h4>
                      <p className="text-white/80">
                        Conocimiento técnico excepcional + habilidades prácticas perfectas. 
                        ¡Mereces un descuento VIP del 25%!
                      </p>
                    </div>
                  )}
                  
                  {(score + minigameScore) >= 250 && (score + minigameScore) < 300 && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-6">
                      <Award className="w-12 h-12 text-[#FDB813] mx-auto mb-3" />
                      <h4 className="text-xl font-bold text-white mb-2">🏆 ¡Eres un Experto Solar!</h4>
                      <p className="text-white/80">
                        Has demostrado un conocimiento excepcional sobre energía solar. 
                        ¡Mereces un descuento especial!
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {gameSteps.map((step, index) => (
                    <div key={step.id} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4`}>
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="font-bold text-white mb-3">{step.title}</h4>
                      <p className="text-sm text-green-200 mb-3">{step.successMessage}</p>
                      <ul className="space-y-2">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="text-sm text-blue-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                  <div className="text-center">
                    <h4 className="text-2xl font-bold text-white mb-4">
                      ¡Tu Familia Merece Vivir Sin Apagones!
                    </h4>
                    <p className="text-green-200 mb-6 text-lg">
                      Ahora sabes cómo Suncar puede darte LIBERTAD ENERGÉTICA total. 
                      ¡Es hora de contactarnos para tu estudio GRATUITO y empezar a ahorrar!
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link
                        href="/solar-survivor"
                        className="px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center gap-2 justify-center transform hover:scale-105"
                      >
                        <RotateCcw className="w-5 h-5" />
                        Jugar el Juego Completo
                      </Link>
                      <Link
                        href="/cotizacion"
                        className="px-8 py-4 bg-gradient-to-r from-[#F26729] to-[#FDB813] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                      >
                        <Zap className="w-5 h-5" />
                        ¡Quiero Mi Estudio GRATUITO Ahora!
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>


    </section>
  )

}