"use client"

import React, { useState } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

const WhatsAppFAB = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  
  const phoneNumber = "5363962417" // Número sin el +
  const defaultMessage = "¡Hola! Me interesa conocer más sobre sus servicios de energía solar. ¿Podrían brindarme información?"

  const handleSendMessage = () => {
    const finalMessage = message.trim() || defaultMessage
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
    setMessage('')
  }

  const toggleDialog = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setMessage(defaultMessage)
    }
  }

  return (
    <>
      {/* Overlay when dialog is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* WhatsApp Dialog */}
      <div className={`
        fixed z-50 transition-all duration-300 ease-out
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
        ${isOpen ? 'bottom-20 right-4 md:bottom-24 md:right-6' : 'bottom-4 right-4 md:bottom-6 md:right-6'}
        origin-bottom-right
      `}>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-80 md:w-96 max-w-[calc(100vw-2rem)]">
          {/* Header */}
          <div className="bg-[#408A7E] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">SunCar Cuba</h3>
                <p className="text-xs text-green-100">¡Estamos aquí para ayudarte!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 mb-2">
                💡 ¡Hola! ¿Tienes alguna pregunta sobre nuestros sistemas de energía solar?
              </p>
              <p className="text-xs text-gray-500">
                Escríbenos y te responderemos lo antes posible.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tu mensaje:</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje aquí..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-[#408A7E] focus:border-transparent transition-all text-sm"
                rows={3}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              className="w-full bg-[#408A7E] hover:bg-[#357066] text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <Send size={18} />
              <span>Enviar a WhatsApp</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Se abrirá WhatsApp con tu mensaje preparado
            </p>
          </div>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={toggleDialog}
        className={`
          fixed z-40 w-14 h-14 md:w-16 md:h-16 bg-[#408A7E] hover:bg-[#357066] 
          text-white rounded-full shadow-lg hover:shadow-xl 
          flex items-center justify-center
          transition-all duration-300 ease-out transform hover:scale-110 active:scale-95
          bottom-4 right-4 md:bottom-6 md:right-6
          ${isOpen ? 'rotate-180 bg-gray-500 hover:bg-gray-600' : 'animate-pulse-soft'}
        `}
        aria-label={isOpen ? "Cerrar chat de WhatsApp" : "Abrir chat de WhatsApp"}
      >
        {isOpen ? (
          <X size={24} className="md:w-7 md:h-7" />
        ) : (
          <MessageCircle size={24} className="md:w-7 md:h-7" />
        )}
      </button>

      {/* Floating indicator when closed */}
      {!isOpen && (
        <div className="fixed bottom-[4.5rem] right-2 md:bottom-[5.5rem] md:right-4 z-30 pointer-events-none">
          <div className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-lg shadow-lg border animate-bounce-soft">
            ¡Escríbenos!
          </div>
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white mx-auto"></div>
        </div>
      )}
    </>
  )
}

export default WhatsAppFAB