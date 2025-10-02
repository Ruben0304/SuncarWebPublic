"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Plus,
  Lightbulb,
  Zap,
} from "lucide-react";
import clsx from "clsx";
import ReactMarkdown from "react-markdown";

// Preguntas frecuentes sobre energías renovables y sistemas fotovoltaicos
const SUGERENCIAS = [
  "¿Cómo funcionan los paneles solares?",
  "¿Qué mantenimiento requieren los paneles solares?",
  "¿Cuánto puedo ahorrar con energía solar?",
  "¿Funcionan los paneles en días nublados?",
  "¿Cuánto tiempo dura la instalación?",
  "¿Necesito baterías para mi sistema solar?",
  "¿Qué pasa si hay un apagón?",
  "¿Puedo expandir mi sistema después?",
];

// Context information about Suncar
const SUNCAR_CONTEXT = `
INFORMACIÓN DETALLADA SOBRE SUNCAR Y EL SITIO WEB:

## SOBRE SUNCAR
Suncar es una empresa cubana especializada en energía solar con más de 5 años de experiencia transformando hogares y negocios con tecnología solar de vanguardia. Ofrecemos soluciones completas de energía renovable para lograr independencia energética.

## SERVICIOS PRINCIPALES:

### 1. INSTALACIÓN DE SISTEMAS FOTOVOLTAICOS
- Paneles monocristalinos y policristalinos de última generación
- Garantía en paneles de fabricantes: 25 años (JSMCH2/Greenheiss)
- Dos años de garantía sobre la instalación
- Eficiencia superior al 20%
- Instalación profesional certificada
- Equipos disponibles: 3kW, 5kW, 10kW, 25kW, 50kW
- Marcas líderes: Huawei, Greenheiss, JSMCH2, Sungrow

### 2. SISTEMAS DE BATERÍAS COMPLETAS
- Baterías LiFePO4 (Litio Hierro Fosfato) de larga duración
- Sistema de gestión inteligente
- Respaldo automático durante apagones
- Monitoreo en tiempo real
- Ampliable modularmente: desde 5kWh escalable según necesidades
- Operan en climas extremos (-20°C a 60°C)
- Software de gestión para optimizar autoconsumo y ahorro

### 3. MANTENIMIENTO Y SOPORTE PREVENTIVO
- Mantenimiento preventivo programado
- Limpieza profesional de paneles
- Diagnóstico y reparaciones
- Soporte técnico 24/7
- Atención a quejas y solicitudes

### 4. CONSULTORÍA ENERGÉTICA
- Evaluación energética personalizada
- Diseño de sistema optimizado
- Análisis de retorno de inversión
- Asesoría en financiamiento
- Consulta gratuita

## PROCESO DE INSTALACIÓN:
1. **Consulta Inicial**: Evaluación del consumo energético y condiciones del hogar
2. **Diseño del Sistema**: Diseño personalizado con cantidad óptima de paneles y baterías según capacidades financieras y reales
3. **Instalación Profesional**: Equipo certificado realiza instalación completa cumpliendo estándares de seguridad
4. **Puesta en Marcha**: Configuración, pruebas, capacitación y activación de garantías

## GARANTÍAS Y BENEFICIOS:
- **Garantía Extendida**: 25 años en paneles, 10-12 años en inversores
- **Equipo Certificado**: Técnicos especializados y certificados
- **Calidad Premium**: Equipos de marcas reconocidas mundialmente
- **Soporte 24/7**: Asistencia técnica disponible siempre

## CONTACTO:
- **Oficina Principal**: Calle 24 entre 1ra y 3ra, Playa, La Habana, Cuba
- **Teléfono**: +5363962417
- **Email**: info@suncarsrl.com
- **Horarios**: Lun-Vie 8:00-18:00, Sáb 9:00-14:00

## PÁGINAS DEL SITIO WEB:

### PÁGINA PRINCIPAL (/)
- Hero con información sobre energía solar para el futuro
- Sección "Sobre Suncar" con especialidades en energía solar
- Características principales: Paneles Premium, Baterías Inteligentes, Soporte Técnico
- Juego interactivo de simulador solar
- Sección especial para clientes existentes con descuentos:
  * Hasta 40% OFF en mantenimiento
  * Descuentos especiales en expansiones
  * Precios preferenciales en productos

### SERVICIOS (/servicios)
- Información detallada de todos los servicios
- Especificaciones técnicas completas
- Proceso de instalación paso a paso
- Beneficios de elegir Suncar
- Por qué elegir energía solar

### CONTACTO (/contacto)
- Formulario de contacto que envía mensaje por WhatsApp
- Información completa de contacto y ubicación
- Mapa interactivo de la oficina
- Horarios de atención
- Diferentes tipos de consultas: cotización, instalación, mantenimiento, financiamiento

### COTIZACIÓN (/cotizacion)
- Sistema de cotización en 3 pasos:
  1. **Información del Hogar**: Tipo de vivienda, tipo de techo
  2. **Consumo Energético**: Factura mensual, personas en hogar, electrodomésticos
  3. **Contacto y Ubicación**: Datos personales y mapa interactivo para seleccionar ubicación
- Cálculo automático de potencia requerida
- Electrodomésticos incluidos: Aire Acondicionado, Refrigerador, Lavadora, TV, Computadora, Microondas, Plancha, Bomba de Agua
- Beneficios: Ahorro hasta 90%, Energía 24/7, Energía limpia

### PROYECTOS (/projectos)
- Galería de proyectos completados
- Estadísticas: 500+ proyectos, 50MW+ instalados, 85% ahorro promedio, 98% satisfacción
- Proyectos destacados con detalles técnicos
- Testimonios de clientes reales
- Capacidades desde 4.2kW hasta 15kW
- Ahorros del 78% al 92%

### TESTIMONIOS (/testimonios)
- Testimonios reales de clientes satisfechos
- Filtros por tipo: residencial y comercial
- Estadísticas de satisfacción
- Calificación promedio 4.9/5
- 500+ clientes satisfechos
- 98% de recomendación
- Testimonios incluyen ubicación, ahorro y tamaño del sistema

## DATOS IMPORTANTES:
- Más de 500 proyectos completados
- 85% de ahorro promedio en factura eléctrica
- Sistemas disponibles desde 3kW hasta 50kW
- Tecnología LiFePO4 para baterías
- Garantías de hasta 25 años en paneles
- Cobertura en toda Cuba
- Descuentos especiales para clientes existentes
- Respaldo durante apagones con sistemas de baterías
- Monitoreo en tiempo real de todos los sistemas
`;

const OPCIONES_FEEDBACK = [
  "Respuesta incorrecta o imprecisa",
  "Respuesta incompleta",
  "No entendió mi pregunta",
  "Respuesta irrelevante al contexto",
  "Lenguaje demasiado técnico o complejo",
  "Respuesta demasiado básica o simple",
  "Otro",
];

// Función para enviar mensaje al chatbot AI con contexto de Suncar
async function sendAIMessage(mensaje: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: mensaje,
        context: SUNCAR_CONTEXT,
        prompt: `Eres el Asistente Virtual de Suncar, una empresa cubana líder en energía solar. 

CONTEXTO COMPLETO: ${SUNCAR_CONTEXT}

INSTRUCCIONES:
- Responde SIEMPRE en español de manera amigable y profesional
- Usa toda la información del contexto para dar respuestas detalladas y precisas
- Si preguntan sobre precios, di que ofrecemos consulta gratuita y que pueden cotizar en /cotizacion
- Si preguntan dónde hacer algo específico, guíalos a la página correcta:
  * Cotizar: /cotizacion
  * Contactar: /contacto  
  * Ver servicios: /servicios
  * Ver proyectos: /projectos
  * Ver testimonios: /testimonios
- Incluye datos específicos como garantías, capacidades, ahorros típicos
- Destaca nuestras marcas: Huawei, Greenheiss, JSMCH2, Sungrow
- Menciona beneficios clave: hasta 90% ahorro, energía 24/7, tecnología LiFePO4
- Si preguntan sobre mantenimiento o problemas técnicos, menciona nuestro soporte 24/7

Mensaje del usuario: "${mensaje}"

Responde como el experto asistente de Suncar basándote en toda la información proporcionada:`,
        model: 'gemini-2.5-flash',
        streaming: false
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        response: data.response,
        timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
        message_id: Math.random().toString(36).substring(2, 10),
      };
    } else {
      throw new Error(data.message || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error sending AI message:', error);
    
    // Fallback a mock response inteligente
    const mensajeLower = mensaje.toLowerCase();
    let response = "¡Hola! Soy el Asistente Virtual de Suncar, tu empresa cubana líder en energía solar. ";
    
    if (mensajeLower.includes('cotiz') || mensajeLower.includes('precio') || mensajeLower.includes('costo')) {
      response += "¡Perfecto! Puedes obtener tu cotización personalizada completamente gratis en nuestra página de cotización (/cotizacion). Nuestro sistema te guía en 3 pasos simples para calcular el sistema solar ideal para tu hogar. Trabajamos con equipos desde 3kW hasta 50kW de marcas líderes como Huawei, Greenheiss y Sungrow. ¡La mayoría de nuestros clientes ahorran entre 78% y 92% en su factura eléctrica!";
    }
    else if (mensajeLower.includes('servicio') || mensajeLower.includes('instalaci') || mensajeLower.includes('panel')) {
      response += "¡Excelente pregunta! Ofrecemos servicios completos de energía solar: 🔸 **Instalación de Sistemas Fotovoltaicos**: Paneles monocristalinos/policristalinos con 25 años de garantía 🔸 **Sistemas de Baterías LiFePO4**: Respaldo 24/7 incluso durante apagones 🔸 **Mantenimiento Preventivo**: Soporte técnico 24/7 🔸 **Consultoría Gratuita**: Evaluación personalizada. Puedes ver todos los detalles en /servicios. ¿Te interesa algún servicio en particular?";
    }
    else if (mensajeLower.includes('contact') || mensajeLower.includes('teléfono') || mensajeLower.includes('hablar')) {
      response += "¡Por supuesto! Puedes contactarnos de varias formas: 📞 **Teléfono**: +5363962417 📧 **Email**: info@suncarsrl.com 📍 **Oficina**: Calle 24 entre 1ra y 3ra, Playa, La Habana 🕒 **Horarios**: Lun-Vie 8:00-18:00, Sáb 9:00-14:00. También tienes nuestro formulario de contacto en /contacto donde puedes escribirnos directamente. ¿En qué podemos ayudarte específicamente?";
    }
    else if (mensajeLower.includes('proyecto') || mensajeLower.includes('ejemplo') || mensajeLower.includes('trabajo')) {
      response += "¡Tenemos más de 500 proyectos completados en toda Cuba! Puedes ver nuestros proyectos destacados en /projectos, donde encontrarás casos reales desde 4.2kW hasta 15kW con ahorros del 78% al 92%. También tenemos testimonios de clientes reales en /testimonios con calificación promedio de 4.9/5. ¿Te gustaría saber sobre algún tipo específico de instalación?";
    }
    else if (mensajeLower.includes('batería') || mensajeLower.includes('almacen') || mensajeLower.includes('apagón')) {
      response += "¡Excelente! Nuestros sistemas de baterías LiFePO4 (Litio Hierro Fosfato) te dan energía 24/7: ⚡ **Respaldo automático** durante apagones 🔋 **Ampliable modularmente**: desde 5kWh 🌡️ **Resistentes**: operan de -20°C a 60°C 📱 **Monitoreo inteligente** en tiempo real 🔧 **Larga duración** con mínimo mantenimiento. ¿Quieres saber más sobre las capacidades disponibles?";
    }
    else if (mensajeLower.includes('ahorro') || mensajeLower.includes('benefit') || mensajeLower.includes('ventaja')) {
      response += "¡Los beneficios son increíbles! Nuestros clientes logran: 💰 **85% ahorro promedio** en factura eléctrica ⚡ **Energía 24/7** con sistemas de respaldo 🌱 **100% energía limpia** y renovable 🏠 **Independencia energética** total 📈 **ROI típico**: 2.8 a 3.8 años 🛡️ **Garantías extendidas**: hasta 25 años. ¿Te interesa calcular tu ahorro potencial con una cotización personalizada?";
    }
    else if (mensajeLower.includes('mantenim') || mensajeLower.includes('soporte') || mensajeLower.includes('ayuda técnica')) {
      response += "¡Nuestro soporte técnico es excepcional! Ofrecemos: 🔧 **Soporte 24/7** siempre disponible 📅 **Mantenimiento preventivo** programado 🧽 **Limpieza profesional** de paneles 🔍 **Diagnóstico y reparaciones** especializadas 👥 **Técnicos certificados** y experimentados. Para clientes existentes tenemos hasta 40% de descuento en servicios de mantenimiento. ¿Necesitas algún tipo de asistencia técnica específica?";
    }
    else if (mensajeLower.includes('garantía') || mensajeLower.includes('warranty')) {
      response += "¡Nuestras garantías son las mejores del mercado! 🛡️ **Paneles**: 25 años (JSMCH2/Greenheiss) ⚙️ **Inversores**: 10-12 años (Huawei/Sungrow) 🔋 **Baterías**: Larga duración con tecnología LiFePO4 🔨 **Instalación**: 2 años de garantía completa 👨‍🔧 **Soporte técnico**: 24/7 de por vida. ¡Respaldamos completamente tu inversión en energía solar!";
    }
    else if (mensajeLower.includes('hola') || mensajeLower.includes('buenos días') || mensajeLower.includes('buenas')) {
      response += "¡Es un placer ayudarte! Soy tu asistente para todo lo relacionado con energía solar en Cuba. Con más de 5 años de experiencia, hemos ayudado a más de 500 familias a lograr independencia energética con ahorros de hasta 90%. ¿Te interesa saber sobre nuestros servicios, obtener una cotización gratuita, o tienes alguna pregunta específica sobre energía solar?";
    }
    else {
      response += `Gracias por tu consulta: "${mensaje}". Como especialistas en energía solar, puedo ayudarte con información sobre: 🏠 **Cotización gratuita** (/cotizacion) - Calcula tu sistema ideal 🔧 **Servicios completos** (/servicios) - Instalación y mantenimiento 📞 **Contacto directo** (/contacto) - Habla con nuestros expertos 🏗️ **Proyectos reales** (/projectos) - Ve nuestro trabajo ⭐ **Testimonios** (/testimonios) - Experiencias de clientes. ¿En qué área específica te puedo ayudar?`;
    }
    
    return {
      response,
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      message_id: Math.random().toString(36).substring(2, 10),
    };
  }
}

// Mock de feedback
async function mockSendFeedback(messageId: string, tipo: string | null, detalles: string | null) {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

interface Mensaje {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  isNew?: boolean;
  feedback?: "positive" | "negative" | null;
  feedbackDetails?: string | null;
  message_id?: string | null;
  isTyping?: boolean;
  displayedContent?: string;
}

const UnifiedChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [chatMode, setChatMode] = useState<"ai" | "whatsapp">("ai"); // Toggle entre AI y WhatsApp
  const [messages, setMessages] = useState<Mensaje[]>([
    {
      role: "agent",
      content: "¡Hola! Soy el Asistente Virtual de SunCar. Puedes elegir entre chatear conmigo usando IA instantánea o enviarme un mensaje por WhatsApp. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
      isNew: false,
      feedback: null,
      feedbackDetails: null,
      message_id: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string[]>([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedbackMessageIndex, setCurrentFeedbackMessageIndex] = useState<number | null>(null);
  const [selectedFeedbackOption, setSelectedFeedbackOption] = useState<number | null>(null);
  const [customFeedback, setCustomFeedback] = useState("");
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const messagesContainer = useRef<HTMLDivElement>(null);

  // WhatsApp config
  const phoneNumber = "5363962417";
  const defaultWhatsAppMessage = "¡Hola! Me interesa conocer más sobre sus servicios de energía solar. ¿Podrían brindarme información?";

  // Función para verificar si el usuario está al final del scroll
  const checkIfUserAtBottom = () => {
    if (!messagesContainer.current) return false;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.current;
    const threshold = 100; // Margen de 100px para considerar que está "al final"
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Función para hacer scroll al final
  const scrollToBottom = () => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
    }
  };

  // Seleccionar sugerencias aleatorias
  useEffect(() => {
    const shuffled = [...SUGERENCIAS].sort(() => 0.5 - Math.random());
    setDisplayedSuggestions(shuffled.slice(0, 3));
  }, []);

  // Listener para detectar cuando el usuario hace scroll
  useEffect(() => {
    const container = messagesContainer.current;
    if (!container) return;

    const handleScroll = () => {
      const atBottom = checkIfUserAtBottom();
      setIsUserAtBottom(atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    
    // Verificar posición inicial
    handleScroll();

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  // Efecto de escritura progresiva
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.isTyping && lastMessage.role === "agent") {
      const fullText = lastMessage.content;
      const currentDisplayed = lastMessage.displayedContent || "";

      if (currentDisplayed.length < fullText.length) {
        const timer = setTimeout(() => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            
            // Verificar que el mensaje sigue siendo el último y está en modo typing
            if (lastMsg.isTyping && lastMsg.role === "agent") {
              const nextChar = fullText[currentDisplayed.length];
              lastMsg.displayedContent = currentDisplayed + nextChar;

              // Si hemos mostrado todo el texto, terminar el efecto de escritura
              if (lastMsg.displayedContent.length >= fullText.length) {
                lastMsg.isTyping = false;
                lastMsg.displayedContent = fullText; // Asegurar que se muestre el texto completo
              }
            }

            return updated;
          });
        }, 0.5); // Velocidad de escritura: 0.5ms por carácter (un poco más lento para mejor UX)

        return () => clearTimeout(timer);
      }
    }
  }, [messages]);

  // Scroll automático inteligente: solo si el usuario está al final
  useEffect(() => {
    if (isUserAtBottom && messagesContainer.current) {
      scrollToBottom();
    }
  }, [messages, isUserAtBottom]);

  // Ocultar sugerencias al enviar mensaje
  useEffect(() => {
    if (messages.length > 1) setShowSuggestions(false);
  }, [messages.length]);

  const startNewConversation = () => {
    setMessages((prev) => [prev[0]]);
    setShowSuggestions(true);
    const shuffled = [...SUGERENCIAS].sort(() => 0.5 - Math.random());
    setDisplayedSuggestions(shuffled.slice(0, 3));
    setInput("");
  };

  const useSuggestion = (s: string) => {
    setInput(s);
    setShowSuggestions(false);
    // Enviar automáticamente la pregunta después de un breve delay
    setTimeout(() => {
      sendMessage(s);
    }, 100);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    // Verificar si hay algún mensaje en modo de escritura progresiva
    const isTypingInProgress = messages.some(msg => msg.isTyping && msg.role === "agent");
    if (!textToSend.trim() || isLoading || isTypingInProgress) return;
    
    if (chatMode === "whatsapp") {
      // Modo WhatsApp: abrir WhatsApp con el mensaje
      const finalMessage = textToSend.trim() || defaultWhatsAppMessage;
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
      window.open(whatsappUrl, '_blank');
      setInput("");
      return;
    }

    // Modo AI: enviar al chatbot
    setShowSuggestions(false);
    const timestamp = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [
      ...prev,
      { role: "user", content: textToSend, timestamp, isNew: true },
    ]);
    const userMessage = textToSend;
    setInput("");
    setIsLoading(true);
    
    // Asegurar que el scroll automático esté activo para nuevos mensajes
    setIsUserAtBottom(true);
    
    try {
      const data = await sendAIMessage(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: data.response,
          timestamp: data.timestamp || timestamp,
          isNew: true,
          feedback: null,
          feedbackDetails: null,
          message_id: data.message_id,
          isTyping: true,
          displayedContent: "",
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "agent",
          content: "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, inténtalo de nuevo.",
          timestamp,
          isNew: true,
          feedback: null,
          feedbackDetails: null,
          message_id: null,
          isTyping: true,
          displayedContent: "",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isNew: false })));
      }, 500);
    }
  };

  // Feedback functions
  const toggleFeedback = (messageIndex: number, type: "positive" | "negative") => {
    if (chatMode === "whatsapp") return; // No feedback para WhatsApp
    
    console.log(`Toggle feedback: messageIndex=${messageIndex}, type=${type}`);
    
    setMessages((prev) => {
      const updated = [...prev];
      const msg = updated[messageIndex];
      if (!msg.message_id) return prev;
      
      console.log(`Current feedback: ${msg.feedback}`);
      
      // Si ya está seleccionado el mismo tipo, desmarcarlo
      if (msg.feedback === type) {
        msg.feedback = null;
        msg.feedbackDetails = null;
        console.log(`Deselecting feedback: ${type}`);
        mockSendFeedback(msg.message_id, null, null);
      } else {
        // Seleccionar el nuevo tipo (esto desmarca automáticamente el anterior si existía)
        msg.feedback = type;
        console.log(`Setting feedback to: ${type}`);
        if (type === "positive") {
          // Limpiar detalles de feedback negativo si existían
          msg.feedbackDetails = null;
          mockSendFeedback(msg.message_id, "positive", null);
        } else {
          // Para feedback negativo, abrir modal si no hay detalles previos
          if (!msg.feedbackDetails) {
            setCurrentFeedbackMessageIndex(messageIndex);
            setSelectedFeedbackOption(null);
            setCustomFeedback("");
            setShowFeedbackModal(true);
          } else {
            // Si ya hay detalles, mantenerlos
            mockSendFeedback(msg.message_id, "negative", msg.feedbackDetails);
          }
        }
      }
      return updated;
    });
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    if (
      currentFeedbackMessageIndex !== null &&
      messages[currentFeedbackMessageIndex].feedbackDetails == null
    ) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[currentFeedbackMessageIndex].feedback = null;
        return updated;
      });
    }
    setCurrentFeedbackMessageIndex(null);
  };

  const submitFeedback = () => {
    if (currentFeedbackMessageIndex === null || selectedFeedbackOption === null) return;
    const feedbackDetail = OPCIONES_FEEDBACK[selectedFeedbackOption];
    const additionalText = selectedFeedbackOption === OPCIONES_FEEDBACK.length - 1 ? customFeedback : null;
    const fullFeedbackDetail = additionalText ? `${feedbackDetail}: ${additionalText}` : feedbackDetail;
    setMessages((prev) => {
      const updated = [...prev];
      const msg = updated[currentFeedbackMessageIndex];
      msg.feedbackDetails = fullFeedbackDetail;
      if (msg.message_id) {
        mockSendFeedback(msg.message_id, "negative", fullFeedbackDetail);
      }
      return updated;
    });
    setShowFeedbackModal(false);
    setCurrentFeedbackMessageIndex(null);
    setSelectedFeedbackOption(null);
    setCustomFeedback("");
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-4 sm:right-4 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 ring-2 ring-[#F26729]/40 hover:ring-[#F26729]/60"
          aria-label="Abrir chat"
        >
          <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8" />
        </button>
      )}

      {/* Contenedor del chat */}
      {isOpen && (
        <div className="fixed bottom-2 right-2 left-2 sm:bottom-4 sm:right-4 sm:left-auto w-auto sm:w-[420px] h-[500px] sm:h-[660px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 animate-in flex flex-col">
          {/* Header */}
          <header className="h-14 sm:h-16 px-4 sm:px-6 flex items-center justify-between bg-primary text-white">
            <div className="flex items-center gap-2 sm:gap-3">
              {chatMode === "ai" ? (
                <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
              <h1 className="text-lg sm:text-xl font-semibold">
                {chatMode === "ai" ? "Asistente IA" : "WhatsApp"}
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Toggle Switch */}
              <div className="flex items-center bg-white/20 rounded-full p-1 mr-2">
                <button
                  onClick={() => setChatMode("ai")}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                    chatMode === "ai" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <Zap className="h-3 w-3 text-orange-400" />
                  IA
                </button>
                <button
                  onClick={() => setChatMode("whatsapp")}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all",
                    chatMode === "whatsapp" 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-white/80 hover:text-white"
                  )}
                >
                  <MessageCircle className="h-3 w-3 text-green-400" />
                  WA
                </button>
              </div>
              <button
                onClick={startNewConversation}
                className="p-1.5 sm:p-2 hover:bg-primary/80 rounded-lg transition-colors flex items-center gap-1"
                title="Nueva conversación"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 sm:p-2 hover:bg-primary/80 rounded-lg transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </header>

          {/* Mensajes */}
          <div
            ref={messagesContainer}
            className="flex-1 overflow-y-auto bg-gray-50 relative"
          >
            {chatMode === "whatsapp" ? (
              // Vista de WhatsApp
              <div className="flex flex-col items-center justify-center h-full space-y-4 p-4 sm:p-6">
                <div className="w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Contacta por WhatsApp
                  </h3>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Escribe tu mensaje y se abrirá WhatsApp para comunicarte directamente con nuestro equipo.
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-xs">
                  <p className="text-sm text-green-700">
                    💚 Te responderemos lo antes posible durante nuestro horario de atención.
                  </p>
                </div>
              </div>
            ) : (
              // Vista de IA con mensajes
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-20 sm:pb-24">
                {messages.map((message, index) => {
                  // Debug: log feedback state for each message
                  if (message.role === "agent" && message.message_id) {
                    console.log(`Message ${index} feedback state:`, message.feedback);
                  }
                  
                  return (
                  <div
                    key={index}
                    className={clsx(
                      "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] transition-all duration-300",
                      message.role === "user" && "ml-auto flex-row-reverse",
                      message.isNew && "animate-message-in"
                    )}
                  >
                    {message.role === "agent" && (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                        <Bot className="text-white h-4 w-4 sm:h-6 sm:w-6" />
                      </div>
                    )}
                    <div className={clsx("space-y-1", message.role === "user" ? "items-end" : "items-start")}>
                      <div className={clsx("flex items-center gap-2", message.role === "user" && "flex-row-reverse")}>
                        <span className="text-xs font-medium text-gray-600">
                          {message.role === "agent" ? "Asistente" : "Tú"}
                        </span>
                        <span className="text-xs text-gray-400">{message.timestamp}</span>
                      </div>
                      <div
                        className={clsx(
                          "p-3 sm:p-4 rounded-2xl shadow-sm max-w-[280px] sm:max-w-[300px]",
                          message.role === "agent"
                            ? "bg-white text-gray-800 rounded-tl-none markdown-content"
                            : "bg-primary text-white rounded-tr-none"
                        )}
                      >
                        {message.role === "user" ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        ) : (
                          <div className="text-sm leading-relaxed markdown-body">
                            <ReactMarkdown>{message.isTyping ? (message.displayedContent || "") : message.content}</ReactMarkdown>
                            {message.isTyping && (
                              <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                            )}
                          </div>
                        )}
                      </div>
                      {/* Botones de feedback solo para IA y respuestas del agente */}
                      {message.role === "agent" && message.message_id && chatMode === "ai" && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => toggleFeedback(index, "positive")}
                            className={clsx(
                              "p-1.5 rounded-full text-xs transition-all duration-200 border-2 font-bold",
                              message.feedback === "positive"
                                ? "bg-green-500 text-white border-green-500 shadow-lg scale-110"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50 border-gray-300 hover:border-green-400"
                            )}
                            title={message.feedback === "positive" ? "Quitar like" : "Dar like"}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => toggleFeedback(index, "negative")}
                            className={clsx(
                              "p-1.5 rounded-full text-xs transition-all duration-200 border-2 font-bold",
                              message.feedback === "negative"
                                ? "bg-red-500 text-white border-red-500 shadow-lg scale-110"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-400"
                            )}
                            title={message.feedback === "negative" ? "Quitar dislike" : "Dar dislike"}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}

                {/* Loading solo para IA */}
                {isLoading && chatMode === "ai" && (
                  <div className="flex justify-start mt-6 animate-fade-in ml-2">
                    <div className="flex gap-2 bg-white rounded-full px-4 py-3 shadow-sm ring-2 ring-[#F26729]/20">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-[0_0_8px_rgba(242,103,41,0.4)]" style={{ animationDelay: "0s" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-[0_0_8px_rgba(242,103,41,0.4)]" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce shadow-[0_0_8px_rgba(242,103,41,0.4)]" style={{ animationDelay: "0.4s" }} />
                    </div>
                  </div>
                )}

                {/* Sugerencias solo para IA */}
                {showSuggestions && !isLoading && messages.length <= 1 && chatMode === "ai" && (
                  <div className="animate-slide-up">
                    <div className="bg-white rounded-xl shadow-md border border-primary/10 overflow-hidden">
                      <div className="bg-primary/5 p-2 sm:p-3 border-b border-primary/10">
                        <p className="text-xs sm:text-sm text-primary font-medium flex items-center gap-2">
                          <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4" />
                          Preguntas frecuentes
                        </p>
                      </div>
                      <div className="p-1.5 sm:p-2">
                        {displayedSuggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => useSuggestion(suggestion)}
                            className="w-full text-left p-2 sm:p-2.5 hover:bg-primary/5 rounded-lg text-xs sm:text-sm text-gray-700 transition-colors flex items-center gap-2 my-1"
                          >
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-primary font-medium">{idx + 1}</span>
                            </div>
                            <span className="leading-relaxed">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botón flotante para volver al final - fuera del área de scroll */}
          {!isUserAtBottom && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-4 z-20 bg-primary text-white rounded-full p-2 shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 animate-bounce"
              aria-label="Ir al final del chat"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}

          {/* Input fijo en la parte inferior */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2 sm:gap-3 items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  chatMode === "whatsapp" 
                    ? "Escribe tu mensaje para WhatsApp..." 
                    : "Escribe tu mensaje..."
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const isTypingInProgress = messages.some(msg => msg.isTyping && msg.role === "agent");
                    if (!isTypingInProgress) {
                      sendMessage();
                    }
                  }
                }}
                className="flex-1 h-10 sm:h-12 py-2 px-3 sm:px-4 rounded-full border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 placeholder-gray-400 text-sm"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || (isLoading && chatMode === "ai") || messages.some(msg => msg.isTyping && msg.role === "agent")}
                className={clsx(
                  "p-2.5 sm:p-3 text-white rounded-full hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md hover:shadow-lg",
                  chatMode === "whatsapp" ? "bg-[#25D366] hover:bg-[#128C7E]" : "bg-primary"
                )}
                aria-label={chatMode === "whatsapp" ? "Enviar a WhatsApp" : "Enviar mensaje"}
              >
                {isLoading && chatMode === "ai" ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                  </svg>
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de feedback negativo */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-5 bg-primary text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  Ayúdanos a mejorar
                </h3>
                <button
                  onClick={closeFeedbackModal}
                  className="p-1 hover:bg-primary/80 rounded-full transition-colors"
                  aria-label="Cerrar feedback"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">¿Por qué consideras que la respuesta no fue útil?</p>
              <div className="space-y-2 sm:space-y-3">
                {OPCIONES_FEEDBACK.map((option, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      "p-2.5 sm:p-3 border rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-2 sm:gap-3",
                      selectedFeedbackOption === idx
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => setSelectedFeedbackOption(idx)}
                  >
                    <div
                      className={clsx(
                        "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        selectedFeedbackOption === idx ? "border-primary" : "border-gray-300"
                      )}
                    >
                      {selectedFeedbackOption === idx && (
                        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary animate-scale-in" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm text-black leading-relaxed">{option}</span>
                  </div>
                ))}
                {/* Opción Otro */}
                {selectedFeedbackOption === OPCIONES_FEEDBACK.length - 1 && (
                  <textarea
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="Por favor, cuéntanos más..."
                    className="w-full p-2.5 sm:p-3 border border-gray-200 rounded-lg text-xs sm:text-sm resize-none h-20 sm:h-24 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-2 sm:mt-3 animate-fade-in"
                  />
                )}
              </div>
              <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
                <button
                  onClick={closeFeedbackModal}
                  className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={selectedFeedbackOption === null}
                  className={clsx(
                    "px-3 py-2 sm:px-4 sm:py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2",
                    selectedFeedbackOption === null && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedChatAssistant;