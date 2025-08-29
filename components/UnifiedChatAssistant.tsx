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

// Mock de sugerencias
const SUGERENCIAS = [
  "¿Para qué sirves?",
  "¿Qué puedes hacer?",
  "¿De qué puedes hablarme?",
  "¿Cómo funcionan los paneles solares?",
  "¿Cuánto cuesta un sistema solar?",
  "¿Qué mantenimiento requieren?",
  "Necesito una cotización",
];

const OPCIONES_FEEDBACK = [
  "Respuesta incorrecta o imprecisa",
  "Respuesta incompleta",
  "No entendió mi pregunta",
  "Respuesta irrelevante al contexto",
  "Lenguaje demasiado técnico o complejo",
  "Respuesta demasiado básica o simple",
  "Otro",
];

// Función para enviar mensaje al chatbot AI
async function sendAIMessage(mensaje: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: mensaje,
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
    throw error;
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
  const messagesContainer = useRef<HTMLDivElement>(null);

  // WhatsApp config
  const phoneNumber = "5363962417";
  const defaultWhatsAppMessage = "¡Hola! Me interesa conocer más sobre sus servicios de energía solar. ¿Podrían brindarme información?";

  // Seleccionar sugerencias aleatorias
  useEffect(() => {
    const shuffled = [...SUGERENCIAS].sort(() => 0.5 - Math.random());
    setDisplayedSuggestions(shuffled.slice(0, 3));
  }, []);

  // Scroll automático al final
  useEffect(() => {
    if (messagesContainer.current) {
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
    }
  }, [messages, isOpen]);

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
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (chatMode === "whatsapp") {
      // Modo WhatsApp: abrir WhatsApp con el mensaje
      const finalMessage = input.trim() || defaultWhatsAppMessage;
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
      { role: "user", content: input, timestamp, isNew: true },
    ]);
    const userMessage = input;
    setInput("");
    setIsLoading(true);
    
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
    
    setMessages((prev) => {
      const updated = [...prev];
      const msg = updated[messageIndex];
      if (!msg.message_id) return prev;
      if (msg.feedback === type) {
        msg.feedback = null;
        msg.feedbackDetails = null;
        mockSendFeedback(msg.message_id, null, null);
      } else {
        msg.feedback = type;
        if (type === "positive") {
          mockSendFeedback(msg.message_id, "positive", null);
        } else {
          setCurrentFeedbackMessageIndex(messageIndex);
          setSelectedFeedbackOption(null);
          setCustomFeedback("");
          setShowFeedbackModal(true);
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
          className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105"
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
                  <Zap className="h-3 w-3" />
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
                  <MessageCircle className="h-3 w-3" />
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
                {messages.map((message, index) => (
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
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {/* Botones de feedback solo para IA y respuestas del agente */}
                      {message.role === "agent" && message.message_id && chatMode === "ai" && (
                        <div className="flex gap-1 mt-2">
                          <button
                            onClick={() => toggleFeedback(index, "positive")}
                            className={clsx(
                              "p-1 rounded-full text-xs transition-colors",
                              message.feedback === "positive"
                                ? "bg-green-100 text-green-600"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            )}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => toggleFeedback(index, "negative")}
                            className={clsx(
                              "p-1 rounded-full text-xs transition-colors",
                              message.feedback === "negative"
                                ? "bg-red-100 text-red-600"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            )}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading solo para IA */}
                {isLoading && chatMode === "ai" && (
                  <div className="flex justify-center mt-6 animate-fade-in">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }} />
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
                    sendMessage();
                  }
                }}
                className="flex-1 h-10 sm:h-12 py-2 px-3 sm:px-4 rounded-full border border-gray-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-gray-700 placeholder-gray-400 text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || (isLoading && chatMode === "ai")}
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