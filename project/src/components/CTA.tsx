import React from 'react';
import { Phone, MessageCircle, Clock, MapPin, Star, Heart, Sparkles, ArrowRight } from 'lucide-react';

const CTA: React.FC = () => {
  return (
    <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-lg px-6 py-3 rounded-full text-sm font-bold mb-8">
              <Heart className="w-5 h-5 text-red-400" />
              <span>¡TU MASCOTA TE NECESITA!</span>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-8 leading-tight">
              No esperes más
              <br />
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">
                ¡Actúa ahora!
              </span>
            </h2>
            
            <p className="text-2xl sm:text-3xl opacity-90 leading-relaxed max-w-4xl mx-auto mb-12">
              Tu mascota merece la <span className="text-yellow-400 font-bold">mejor atención</span> y tú mereces la 
              <span className="text-green-400 font-bold"> tranquilidad</span> de saber que está en las mejores manos.
            </p>
          </div>

          {/* Urgency Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center group">
              <div className="text-4xl sm:text-5xl font-black text-red-400 mb-2 group-hover:scale-110 transition-transform duration-300">24h</div>
              <div className="text-sm sm:text-base opacity-80">Emergencias</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl sm:text-5xl font-black text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">15min</div>
              <div className="text-sm sm:text-base opacity-80">Respuesta</div>
            </div>
            <div className="text-center group">
              <div className="flex items-center justify-center gap-1 text-4xl sm:text-5xl font-black text-yellow-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                <span>5</span>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              </div>
              <div className="text-sm sm:text-base opacity-80">Calificación</div>
            </div>
            <div className="text-center group">
              <div className="text-4xl sm:text-5xl font-black text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">500+</div>
              <div className="text-sm sm:text-base opacity-80">Vidas Salvadas</div>
            </div>
          </div>

          {/* Main CTA Buttons */}
          <div className="mb-16">
            <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-3xl mx-auto">
              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/573012908253?text=🚨%20¡QUIERO%20AGENDAR%20CITA%20URGENTE!%20🚨%0A%0ANombre:%0AMascota:%0AServicio%20necesario:%0AUbicación:"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4 animate-glow"
              >
                <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-2xl">¡AGENDA AHORA!</div>
                  <div className="text-sm opacity-90">WhatsApp - Respuesta inmediata</div>
                </div>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </a>

              {/* Phone CTA */}
              <a
                href="tel:+573012908253"
                className="group flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-6 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-4"
              >
                <Phone className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-left">
                  <div className="text-2xl">EMERGENCIAS</div>
                  <div className="text-sm opacity-90">301-290-8253</div>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h4 className="flex items-center justify-center gap-3 text-2xl font-bold mb-6">
                <Clock className="w-6 h-6 text-green-400" />
                Horarios de Atención
              </h4>
              <div className="space-y-3 text-lg">
                <div className="flex justify-between">
                  <span>Lunes - Viernes:</span>
                  <span className="font-semibold">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sábados:</span>
                  <span className="font-semibold">8:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergencias:</span>
                  <span className="font-semibold text-red-400">24/7</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h4 className="flex items-center justify-center gap-3 text-2xl font-bold mb-6">
                <MapPin className="w-6 h-6 text-blue-400" />
                Zona de Cobertura
              </h4>
              <div className="space-y-3 text-lg">
                <div>✅ Servicio a domicilio en toda la ciudad</div>
                <div>✅ Consultas virtuales disponibles</div>
                <div>✅ Transporte de emergencia incluido</div>
                <div>✅ Cobertura 24/7 para urgencias</div>
              </div>
            </div>
          </div>

          {/* Final Urgency Message */}
          <div className="bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl p-8 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl sm:text-4xl font-black mb-4">
              ⏰ Cada minuto cuenta para tu mascota
            </h3>
            <p className="text-xl sm:text-2xl mb-6 font-semibold">
              No dejes que un problema menor se convierta en una emergencia. 
              <br />
              <span className="text-yellow-200">¡Agenda tu cita HOY mismo!</span>
            </p>
            <div className="text-lg font-bold">
              🎯 Respuesta en menos de 15 minutos • 🏆 Garantía de satisfacción • ❤️ Tu mascota en las mejores manos
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;