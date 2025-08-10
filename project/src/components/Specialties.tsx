import React from 'react';
import { 
  Heart, 
  Brain, 
  Bone, 
  Eye, 
  Scissors, 
  TestTube2,
  Stethoscope,
  Activity,
  Zap,
  Shield
} from 'lucide-react';

const Specialties: React.FC = () => {
  const specialties = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Cardiología Veterinaria",
      description: "Diagnóstico y tratamiento especializado de enfermedades cardíacas",
      features: [
        "Electrocardiogramas digitales",
        "Ecocardiografías Doppler",
        "Monitoreo cardíaco 24h",
        "Tratamientos farmacológicos avanzados",
        "Cirugías cardíacas menores"
      ],
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      image: "https://images.pexels.com/photos/6816847/pexels-photo-6816847.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Neurología Veterinaria",
      description: "Atención especializada del sistema nervioso central y periférico",
      features: [
        "Evaluación neurológica completa",
        "Resonancia magnética",
        "Electroencefalogramas",
        "Tratamiento de epilepsia",
        "Rehabilitación neurológica"
      ],
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      image: "https://images.pexels.com/photos/6816865/pexels-photo-6816865.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Bone className="w-8 h-8" />,
      title: "Traumatología y Ortopedia",
      description: "Cirugías óseas y tratamiento de lesiones musculoesqueléticas",
      features: [
        "Cirugías de fractura",
        "Artroscopias",
        "Prótesis articulares",
        "Fisioterapia especializada",
        "Medicina regenerativa"
      ],
      color: "from-orange-500 to-yellow-500",
      bgColor: "bg-orange-50",
      image: "https://images.pexels.com/photos/6816861/pexels-photo-6816861.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Oftalmología Veterinaria",
      description: "Cuidado integral de la salud ocular de tu mascota",
      features: [
        "Cirugías de cataratas",
        "Tratamiento de glaucoma",
        "Microsurgía ocular",
        "Lentes intraoculares",
        "Terapia láser"
      ],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      image: "https://images.pexels.com/photos/6816870/pexels-photo-6816870.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Scissors className="w-8 h-8" />,
      title: "Cirugía General",
      description: "Procedimientos quirúrgicos con tecnología de vanguardia",
      features: [
        "Cirugías laparoscópicas",
        "Esterilizaciones",
        "Cirugías de tejidos blandos",
        "Oncología quirúrgica",
        "Cirugías de emergencia"
      ],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      image: "https://images.pexels.com/photos/6816869/pexels-photo-6816869.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <TestTube2 className="w-8 h-8" />,
      title: "Medicina Interna",
      description: "Diagnóstico y tratamiento de enfermedades sistémicas",
      features: [
        "Endocrinología veterinaria",
        "Gastroenterología",
        "Nefrología",
        "Hematología",
        "Medicina geriátrica"
      ],
      color: "from-teal-500 to-green-500",
      bgColor: "bg-teal-50",
      image: "https://images.pexels.com/photos/6235488/pexels-photo-6235488.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Medicina de Emergencias",
      description: "Atención crítica y cuidados intensivos 24/7",
      features: [
        "Unidad de cuidados intensivos",
        "Ventilación mecánica",
        "Monitoreo multiparamétrico",
        "Transfusiones sanguíneas",
        "Soporte vital avanzado"
      ],
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-50",
      image: "https://images.pexels.com/photos/4269020/pexels-photo-4269020.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    },
    {
      icon: <Stethoscope className="w-8 h-8" />,
      title: "Medicina Preventiva",
      description: "Programas de prevención y bienestar integral",
      features: [
        "Planes de vacunación",
        "Medicina preventiva geriátrica",
        "Programas de bienestar",
        "Chequeos anuales",
        "Educación en salud"
      ],
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      image: "https://images.pexels.com/photos/6816848/pexels-photo-6816848.jpeg?auto=compress&cs=tinysrgb&w=800&h=300&dpr=1"
    }
  ];

  return (
    <section id="especialidades" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Shield className="w-4 h-4" />
            <span>ESPECIALIDADES MÉDICAS</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black mb-6">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Especialistas Certificados
            </span>
            <br />
            <span className="text-gray-800">
              en Cada Área
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Nuestro equipo de especialistas cuenta con certificaciones  y 
            años de experiencia en las áreas más críticas de la medicina veterinaria.
          </p>
        </div>

        {/* Specialties Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialties.map((specialty, index) => (
            <div
              key={index}
              className={`group bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden shadow-lg border border-gray-100`}
            >
              {/* Banner Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={specialty.image}
                  alt={specialty.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${specialty.color} opacity-70`}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                {/* Icon on Image */}
                <div className="absolute top-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center text-white">
                  {specialty.icon}
                </div>
                
                {/* Title on Image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {specialty.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-4">

                {/* Description */}
                <p className="text-gray-600 mb-3 leading-relaxed text-sm">
                  {specialty.description}
                </p>

                {/* Features */}
                <ul className="space-y-1 mb-3">
                  {specialty.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-xs text-gray-700">
                      <div className="w-1.5 h-1.5 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex-shrink-0 mt-1.5"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm">
                  Consultar Especialista
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Necesitas una consulta especializada?
          </h3>
          <p className="text-lg mb-6 opacity-90 max-w-xl mx-auto">
            Nuestros especialistas están listos para brindar la atención que tu mascota necesita. 
            Agenda una consulta y recibe un diagnóstico preciso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573012908253"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <span>📱</span>
              <span>Consultar por WhatsApp</span>
            </a>
            <a
              href="tel:+573012908253"
              className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <span>📞</span>
              <span>Llamar Ahora</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Specialties;