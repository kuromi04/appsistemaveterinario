import React, { useEffect, useState } from 'react';
import { MessageCircle, Heart, Shield, Star, ArrowRight, Sparkles, Phone } from 'lucide-react';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="inicio" className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 bg-green-500/20 rounded-full animate-float blur-xl"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-yellow-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-500/20 rounded-full animate-float blur-xl" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-3 glass-card text-orange-400 px-6 py-3 rounded-full text-sm font-bold tracking-wide animate-pulse-slow">
              <Heart className="w-5 h-5" />
              <span>CLÍNICA VETERINARIA ANIMAL SWEET</span>
              <Sparkles className="w-4 h-4" />
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight">
              <span 
                className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: '#f97316'
                }}
              >
                Cuidamos
              </span>
              <br />
              <span className="text-white drop-shadow-2xl">a tu mejor</span>
              <br />
              <span 
                className="inline-block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl"
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: '#fb923c'
                }}
              >
                amigo
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-200 leading-relaxed max-w-2xl drop-shadow-lg">
              Atención veterinaria profesional <span className="text-orange-400 font-bold">a domicilio</span> y en clínica. 
              <br />
              <span className="text-red-400 font-semibold">¡Tu mascota es nuestra prioridad!</span>
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 py-8">
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-orange-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">500+</div>
                <div className="text-sm sm:text-base text-gray-400">Mascotas Felices</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-red-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">24/7</div>
                <div className="text-sm sm:text-base text-gray-400">Emergencias</div>
              </div>
              <div className="text-center group">
                <div className="flex items-center justify-center gap-1 text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-400 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                  <span>5</span>
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                </div>
                <div className="text-sm sm:text-base text-gray-400">Calificación</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="https://wa.me/573012908253"
                target="_blank"
                rel="noopener noreferrer"
                className="group btn-modern bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 animate-glow"
              >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>¡Agenda por WhatsApp!</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              
              <a
                href="tel:+573012908253"
                className="group btn-modern glass-card text-white hover:bg-red-600 px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl border-2 border-red-500 hover:border-red-400 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
              >
                <Phone className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
                <span>Emergencias</span>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-6 text-base text-gray-400">
              <div className="flex items-center gap-3 group">
                <Shield className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Médicos Certificados</span>
              </div>
              <div className="flex items-center gap-3 group">
                <Heart className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Servicio a Domicilio</span>
              </div>
              <div className="flex items-center gap-3 group">
                <Star className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
                <span>Atención 24/7</span>
              </div>
            </div>
          </div>

          {/* Enhanced Image */}
          <div className={`relative ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <img
                  src="https://images.pexels.com/photos/6816848/pexels-photo-6816848.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Veterinario profesional examinando mascota"
                  className="w-full h-[500px] sm:h-[600px] lg:h-[700px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent"></div>
                
                {/* Floating Info Cards */}
                <div className="absolute bottom-6 right-6 glass-card p-4 rounded-2xl shadow-xl animate-float max-w-[160px] z-20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">Dr. Virtual IA</div>
                      <div className="text-xs text-gray-200">Consulta Gratis</div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-6 left-6 glass-card p-4 rounded-2xl shadow-xl animate-float z-20" style={{ animationDelay: '1s' }}>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">98%</div>
                    <div className="text-xs text-gray-200">Satisfacción</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-red-500/20 rounded-3xl transform rotate-6 scale-105 -z-10 animate-pulse blur-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-red-500/10 to-pink-500/10 rounded-3xl transform -rotate-3 scale-110 -z-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;