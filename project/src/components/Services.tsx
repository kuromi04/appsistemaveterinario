import React, { useEffect, useState } from 'react';
import { 
  Stethoscope, 
  Syringe, 
  TestTube, 
  Heart, 
  Home,
  Calendar,
  MessageCircle,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
  popular?: boolean;
  color: string;
  image: string;
}

const Services: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('services-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const services: Service[] = [
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Consulta Veterinaria",
      description: "Evaluación completa con diagnóstico profesional y plan de tratamiento personalizado.",
      price: "Desde $80.000",
      popular: true,
      color: "from-orange-500 to-red-500",
      image: "https://images.pexels.com/photos/6816848/pexels-photo-6816848.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1"
    },
    {
      icon: <Syringe className="w-8 h-8" />,
      title: "Vacunación Completa",
      description: "Protección integral con vacunas de alta calidad según calendario sanitario.",
      price: "Desde $45.000",
      color: "from-red-500 to-pink-500",
      image: "https://images.pexels.com/photos/6816865/pexels-photo-6816865.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1"
    },
    {
      icon: <TestTube className="w-8 h-8" />,
      title: "Laboratorio Clínico",
      description: "Análisis completos con tecnología de vanguardia y resultados rápidos.",
      price: "Desde $60.000",
      color: "from-orange-600 to-red-600",
      image: "https://images.pexels.com/photos/6816861/pexels-photo-6816861.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Emergencias 24/7",
      description: "Atención de emergencia inmediata las 24 horas del día, todos los días.",
      price: "Consultar",
      color: "from-red-600 to-pink-600",
      image: "https://images.pexels.com/photos/6816870/pexels-photo-6816870.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1"
    },
    {
      icon: <Home className="w-8 h-8" />,
      title: "Servicio a Domicilio",
      description: "Atención veterinaria completa en la comodidad de tu hogar.",
      price: "Desde $100.000",
      popular: true,
      color: "from-orange-500 to-red-500",
      image: "https://images.pexels.com/photos/6816869/pexels-photo-6816869.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=1"
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <div id="services-section" className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 glass-card text-orange-700 px-6 py-3 rounded-full text-sm font-bold mb-6">
            <Calendar className="w-5 h-5" />
            <span>SERVICIOS PROFESIONALES</span>
            <Sparkles className="w-4 h-4" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Servicios que
            </span>
            <br />
            <span className="text-gray-800">
              tu mascota necesita
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Atención veterinaria integral con precios transparentes y calidad garantizada
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden border border-gray-100 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
                  <Star className="w-3 h-3 fill-current" />
                  Popular
                </div>
              )}

              {/* Banner Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-80`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Icon on Image */}
                <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white">
                  {service.icon}
                </div>
                
                {/* Title on Image */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {service.title}
                  </h3>
                  <div className="text-2xl font-black text-white">
                    {service.price}
                  </div>
                </div>
              </div>
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 p-[2px]`}>
                <div className="w-full h-full bg-white rounded-3xl"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 p-6">

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>

                {/* Button */}
                <button className={`w-full py-4 px-6 bg-gradient-to-r ${service.color} text-white rounded-full font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group/btn`}>
                  <span>Agendar Ahora</span>
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className={`text-center bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-12 text-white ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h3 className="text-3xl sm:text-4xl font-black mb-4">
            ¿Listo para cuidar a tu mascota?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Agenda tu cita ahora y recibe atención veterinaria de primera calidad
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573012908253"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-green-600 px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-3 group"
            >
              <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              <span>¡Agenda por WhatsApp!</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;