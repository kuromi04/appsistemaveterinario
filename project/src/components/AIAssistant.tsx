import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy la Dra. marIA, tu asistente de consulta veterinaria. ¿En qué puedo ayudarte con tu mascota hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = {
      greetings: [
        '¡Hola! Estoy aquí para ayudarte con consultas sobre la salud de tu mascota.',
        '¡Bienvenido/a! ¿Cómo está tu mascota hoy?'
      ],
      symptoms: [
        'Los síntomas que describes podrían indicar varias condiciones. Te recomiendo agendar una consulta presencial para un diagnóstico preciso.',
        'Es importante que un veterinario examine a tu mascota en persona. Mientras tanto, mantén a tu mascota cómoda y observa cualquier cambio.'
      ],
      emergency: [
        '🚨 Si es una emergencia, contacta inmediatamente a nuestro servicio de urgencias al 301-290-8253 o acude al centro veterinario más cercano.',
        'Para situaciones urgentes, no dudes en llamarnos. Estamos disponibles para emergencias las 24 horas.'
      ],
      appointment: [
        'Puedes agendar tu cita online haciendo clic en "Agendar Cita" o contactándonos por WhatsApp. ¿Qué tipo de consulta necesitas?',
        'Te ayudo a programar tu cita. ¿Prefieres consulta a domicilio o en clínica? ¿Qué servicio específico necesitas?'
      ],
      general: [
        'Basándome en tu consulta, te recomiendo que programes una cita para una evaluación completa. Cada mascota es única y requiere atención personalizada.',
        'Para darte la mejor recomendación, necesitaría más detalles. Te sugiero agendar una consulta donde podamos evaluar a tu mascota adecuadamente.'
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hola') || lowerMessage.includes('hello') || lowerMessage.includes('buenas')) {
      return responses.greetings[Math.floor(Math.random() * responses.greetings.length)];
    }
    
    if (lowerMessage.includes('emergencia') || lowerMessage.includes('urgente') || lowerMessage.includes('grave')) {
      return responses.emergency[Math.floor(Math.random() * responses.emergency.length)];
    }
    
    if (lowerMessage.includes('cita') || lowerMessage.includes('agenda') || lowerMessage.includes('turno')) {
      return responses.appointment[Math.floor(Math.random() * responses.appointment.length)];
    }
    
    if (lowerMessage.includes('síntoma') || lowerMessage.includes('enfermo') || lowerMessage.includes('dolor') || lowerMessage.includes('vomito') || lowerMessage.includes('diarrea')) {
      return responses.symptoms[Math.floor(Math.random() * responses.symptoms.length)];
    }
    
    return responses.general[Math.floor(Math.random() * responses.general.length)];
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse(inputText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un error. Por favor, intenta nuevamente o contacta directamente con nuestra clínica.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 btn-modern bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-glow ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center animate-pulse font-bold">
          <Sparkles className="w-3 h-3" />
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md glass-card rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  Dra. marIA
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                </h3>
                <p className="text-sm opacity-90">Asistente Veterinaria IA</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white scrollbar-thin">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.isUser 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                  }`}>
                    {message.isUser ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`p-3 rounded-2xl shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in-up">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe los síntomas de tu mascota..."
                className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 text-sm"
                rows={2}
                disabled={isTyping}
              />
              <button
                onClick={sendMessage}
                disabled={!inputText.trim() || isTyping}
                className="btn-modern bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-2 rounded-xl transition-all duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              ⚠️ Esta es una consulta preliminar. Para diagnósticos precisos, agenda una cita presencial.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;