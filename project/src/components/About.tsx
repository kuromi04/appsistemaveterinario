import React, { useEffect, useState } from 'react';
import { Shield, Award, Heart, Users, Clock, MapPin, CheckCircle } from 'lucide-react';

const About: React.FC = () => {
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

    const element = document.getElementById('about-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Médicos Certificados",
      description: "Profesionales con años de experiencia",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Atención Personalizada",
      description: "Cada mascota recibe un plan de cuidado único y personalizado",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Disponibilidad 24/7",
      description: "Emergencias atendidas las 24 horas, los 7 días de la semana",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Servicio a Domicilio",
      description: "Llevamos la clínica hasta tu hogar para mayor comodidad",
      color: "from-purple-500 to-indigo-500"
    }
  ];

  const stats = [
    { number: "500+", label: "Mascotas Atendidas", color: "text-green-500" },
    { number: "3+", label: "Años de Experiencia", color: "text-blue-500" },
    { number: "24/7", label: "Disponibilidad", color: "text-purple-500" },
    { number: "5⭐", label: "Calificación Promedio", color: "text-yellow-500" }
  ];

  const achievements = [
    "Atención Integral desde consultas preventivas hasta cirugías especializadas",
    "Tecnología Avanzada con equipos de última generación para diagnósticos precisos",
    "Compromiso Social con programas de adopción y cuidado responsable",
    "Formación Continua del equipo médico en las últimas técnicas veterinarias"
  ];

  return (
    <section id="nosotros" className="section-padding bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div id="about-section" className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 glass-card text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            <span>SOBRE NOSOTROS</span>
          </div>
          
          <h2 className="heading-responsive font-black mb-6">
            <span className="text-gradient-green">
              Cuidamos a tu mascota
            </span>
            <br />
            <span className="text-gray-800">
              como si fuera nuestra
            </span>
          </h2>
          
          <p className="text-responsive text-gray-600 max-w-3xl mx-auto leading-relaxed">
            En Animal Sweet, entendemos que tu mascota es parte de tu familia. Por eso, 
            ofrecemos atención veterinaria integral con el amor y profesionalismo que merecen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center mb-16">
          {/* Content */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
                Nuestra Misión
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Brindar atención veterinaria de excelencia, combinando tecnología de vanguardia 
                con un trato humano y personalizado. Nos comprometemos a ser el puente entre 
                tu amor por tu mascota y su bienestar integral.
              </p>
              
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{achievement.split(' ')[0]} {achievement.split(' ')[1]}</h4>
                      <p className="text-gray-600 text-sm">{achievement.split(' ').slice(2).join(' ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Image */}
          <div className={`relative ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            <div className="relative z-10">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                <img
                  src="https://images.pexels.com/photos/6816861/pexels-photo-6816861.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Equipo veterinario profesional"
                  className="w-full h-[400px] sm:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              
              {/* Enhanced Floating Card */}
              <div className="absolute -bottom-6 -left-4 sm:-left-6 glass-card p-4 sm:p-6 rounded-2xl shadow-xl animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-800">2000+</div>
                    <div className="text-sm sm:text-base text-gray-600">Mascotas Felices</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-blue-500/20 rounded-3xl transform rotate-6 scale-105 -z-10 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-pink-500/10 rounded-3xl transform -rotate-3 scale-110 -z-20"></div>
          </div>
        </div>

        {/* Enhanced Features Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="card-modern text-center p-6 lg:p-8 group hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 text-white`}>
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Enhanced Stats */}
        <div className={`glass-card rounded-3xl p-8 lg:p-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className={`text-3xl sm:text-4xl font-black mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  {stat.number}
                </div>
                <div className="text-sm sm:text-lg text-gray-600">{stat.label}</div>
                <div className={`w-full h-1 ${stat.color.replace('text-', 'bg-')}/20 rounded-full mt-2`}>
                  <div className={`w-full h-full ${stat.color.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;