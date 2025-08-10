import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Phone, 
  MessageCircle, 
  Zap, 
  Heart,
  Activity,
  Shield
} from 'lucide-react';

const Emergency: React.FC = () => {
  const emergencyServices = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Emergencias Cardíacas",
      description: "Atención inmediata para problemas del corazón",
      response: "5-10 min"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: "Trauma y Accidentes",
      description: "Estabilización y tratamiento de lesiones graves",
      response: "3-8 min"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Intoxicaciones",
      description: "Protocolo rápido para casos de envenenamiento",
      response: "2-5 min"
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: "Dificultad Respiratoria",
      description: "Soporte vital inmediato para problemas respiratorios",
      response: "1-3 min"
    }
  ];

  const emergencySigns = [
    "Dificultad para respirar o jadeo excesivo",
    "Pérdida de conciencia o convulsiones",
    "Sangrado abundante que no se detiene",
    "Vómito o diarrea con sangre",
    "Imposibilidad para orinar o defecar",
    "Trauma por accidente vehicular",
    "Ingestión de sustancias tóxicas",
    "Hinchazón abdominal súbita",
    "Temperatura corporal muy alta o muy baja",
    "Dolor extremo o llanto constante"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <AlertTriangle className="w-4 h-4" />
            <span>EMERGENCIAS 24/7</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Atención de Emergencia
            </span>
            <br />
            <span className="text-gray-800">
              las 24 Horas
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Cuando tu mascota necesita atención urgente, cada segundo cuenta. 
            Nuestro equipo de emergencias está disponible 24/7 para salvar vidas.
          </p>
        </div>

        {/* Emergency Contact */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl p-8 lg:p-12 text-white text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10" />
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-black mb-4">
                ¿Es una Emergencia?
              </h3>
              
              <p className="text-xl mb-8 opacity-90">
                No esperes. Contacta inmediatamente a nuestro equipo de emergencias.
              </p>

              <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <a
                  href="tel:+573012908253"
                  className="group bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/30 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                >
                  <Phone className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-bold mb-2">Llamar Ahora</h4>
                  <p className="text-lg font-semibold">301-290-8253</p>
                  <p className="text-sm opacity-80 mt-2">Respuesta inmediata</p>
                </a>

                <a
                  href="https://wa.me/573012908253?text=🚨%20EMERGENCIA%20VETERINARIA%20🚨%0A%0ANombre:%0AMascota:%0AEmergencia:%0AUbicación:"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/20 backdrop-blur-lg hover:bg-white/30 border border-white/30 rounded-2xl p-6 transition-all duration-300 hover:scale-105"
                >
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-bold mb-2">WhatsApp</h4>
                  <p className="text-lg font-semibold">Emergencias</p>
                  <p className="text-sm opacity-80 mt-2">Mensaje directo</p>
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Disponible 24/7</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>Respuesta Garantizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Servicios de Emergencia Especializados
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyServices.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-red-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 text-white">
                  {service.icon}
                </div>
                
                <h4 className="text-xl font-bold text-gray-800 mb-2">
                  {service.title}
                </h4>
                
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-red-500" />
                  <span className="text-red-600 font-semibold">
                    Respuesta: {service.response}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Signs */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Signs List */}
          <div>
            <h3 className="text-3xl font-bold text-gray-800 mb-8">
              Señales de Emergencia
            </h3>
            
            <div className="space-y-4">
              {emergencySigns.map((sign, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-red-100"
                >
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700">{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Protocol */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-100">
            <h3 className="text-3xl font-bold text-gray-800 mb-6">
              Protocolo de Emergencia
            </h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Mantén la Calma</h4>
                  <p className="text-gray-600">Evalúa la situación y mantén a tu mascota lo más tranquila posible.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Contacta Inmediatamente</h4>
                  <p className="text-gray-600">Llama o envía mensaje describiendo la emergencia y tu ubicación.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Sigue Instrucciones</h4>
                  <p className="text-gray-600">Nuestro equipo te guiará mientras llegamos a tu ubicación.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Prepara el Transporte</h4>
                  <p className="text-gray-600">Si es necesario, prepara a tu mascota para el traslado seguro.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-red-700 font-semibold text-center">
                ⚠️ En caso de emergencia extrema, dirígete inmediatamente 
                a la clínica veterinaria más cercana mientras nos contactas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Emergency;