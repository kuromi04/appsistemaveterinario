import React from 'react';
import { 
  Heart, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock,
  Star,
  ArrowUp
} from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Main Footer */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8 group">
            <img 
              src="/Animal Sweet.png" 
              alt="Animal Sweet Logo" 
              className="w-16 h-16 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-glow shadow-lg"
            />
            <div>
              <h3 className="text-3xl font-black">Animal Sweet</h3>
              <p className="text-gray-400">Clínica Veterinaria</p>
            </div>
          </div>
          
          <p className="text-xl text-gray-300 leading-relaxed mb-12 max-w-2xl mx-auto">
            Cuidamos a tu mejor amigo con amor, profesionalismo y tecnología de vanguardia. 
            Tu mascota es parte de nuestra familia.
          </p>

          {/* Contact Info */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <Phone className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Teléfono</h4>
              <p className="text-2xl font-bold text-orange-400">301-290-8253</p>
              <p className="text-gray-400">Emergencias 24/7</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <MessageCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">WhatsApp</h4>
              <p className="text-xl font-bold text-red-400">Respuesta inmediata</p>
              <p className="text-gray-400">Agenda tu cita ahora</p>
            </div>

            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <MapPin className="w-8 h-8 text-orange-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold mb-2">Servicio</h4>
              <p className="text-xl font-bold text-orange-400">A Domicilio</p>
              <p className="text-gray-400">Toda la ciudad</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-black text-orange-400 mb-2">500+</div>
              <div className="text-gray-400">Mascotas Atendidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-red-400 mb-2">24/7</div>
              <div className="text-gray-400">Disponibilidad</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-black text-yellow-400 mb-2">
                <span>5</span>
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div className="text-gray-400">Calificación</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-orange-400 mb-2">3+</div>
              <div className="text-gray-400">Años de Experiencia</div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 mb-8">
            <h3 className="text-3xl font-black mb-4">¿Listo para cuidar a tu mascota?</h3>
            <p className="text-xl mb-6 opacity-90">No esperes más. Tu mascota te necesita ahora.</p>
            <a
              href="https://wa.me/573012908253"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-600 px-10 py-4 rounded-full font-black text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center gap-3 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              <span>¡Agenda Ahora!</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-center md:text-left">
              © 2024 Animal Sweet - Clínica Veterinaria. Todos los derechos reservados.
            </div>
            
            <button
              onClick={scrollToTop}
              className="btn-modern glass-card hover:bg-white/20 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
              title="Ir arriba"
            >
              <ArrowUp className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;