import React from 'react';
import { Award, GraduationCap, Heart, Users } from 'lucide-react';

const Team: React.FC = () => {
  const teamMembers = [
    {
      name: "Dr. Carlos Martínez",
      specialty: "Cardiología Veterinaria",
      experience: "12 años",
      education: "Universidad Nacional - Especialización en Cornell University",
      certifications: ["Cardiología ACVIM", "Ecocardiografía Avanzada", "Cirugía Cardíaca"],
      image: "https://images.pexels.com/photos/6816869/pexels-photo-6816869.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Especialista en cardiología con más de una década salvando vidas. Pionero en técnicas de ecocardiografía en la región."
    },
    {
      name: "Dra. Ana López",
      specialty: "Neurología Veterinaria",
      experience: "10 años",
      education: "Universidad Javeriana - Maestría en UC Davis",
      certifications: ["Neurología ACVIM", "Resonancia Magnética", "Neurocirugía"],
      image: "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Experta en neurología con formación internacional. Especializada en tratamientos de epilepsia y neurocirugía."
    },
    {
      name: "Dr. Miguel Rodríguez",
      specialty: "Cirugía y Traumatología",
      experience: "15 años",
      education: "Universidad de Antioquia - Fellowship en Texas A&M",
      certifications: ["Cirugía ACVS", "Artroscopia", "Medicina Regenerativa"],
      image: "https://images.pexels.com/photos/6816848/pexels-photo-6816848.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Cirujano ortopédico con vasta experiencia en cirugías complejas. Líder en técnicas mínimamente invasivas."
    },
    {
      name: "Dra. Laura Fernández",
      specialty: "Oftalmología Veterinaria",
      experience: "8 años",
      education: "Universidad Nacional - Especialización en Animal Eye Care",
      certifications: ["Oftalmología ACVO", "Microsurgía Ocular", "Terapia Láser"],
      image: "https://images.pexels.com/photos/6816870/pexels-photo-6816870.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Oftalmóloga especializada en cirugías de cataratas y microsurgía. Experta en las técnicas más avanzadas."
    },
    {
      name: "Dr. Roberto Silva",
      specialty: "Medicina Interna",
      experience: "14 años",
      education: "Universidad CES - Residencia en University of Pennsylvania",
      certifications: ["Medicina Interna ACVIM", "Endocrinología", "Gastroenterología"],
      image: "https://images.pexels.com/photos/6816847/pexels-photo-6816847.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Internista con amplia experiencia en diagnóstico de enfermedades complejas. Especialista en endocrinología."
    },
    {
      name: "Dra. Patricia Morales",
      specialty: "Medicina de Emergencias",
      experience: "9 años",
      education: "Universidad del Rosario - Certificación en Emergency Medicine",
      certifications: ["Medicina de Emergencias", "Cuidados Intensivos", "Soporte Vital"],
      image: "https://images.pexels.com/photos/6816865/pexels-photo-6816865.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1",
      description: "Especialista en emergencias disponible 24/7. Experta en cuidados intensivos y soporte vital avanzado."
    }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, number: "15+", label: "Especialistas" },
    { icon: <Award className="w-8 h-8" />, number: "50+", label: "Certificaciones" },
    { icon: <GraduationCap className="w-8 h-8" />, number: "120+", label: "Años de Experiencia" },
    { icon: <Heart className="w-8 h-8" />, number: "500+", label: "Vidas Salvadas" }
  ];

  return (
    <section id="equipo" className="py-16 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Users className="w-4 h-4" />
            <span>NUESTRO EQUIPO</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-black mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Especialistas de
            </span>
            <br />
            <span className="text-white">
              Clase Mundial
            </span>
          </h2>
          
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Nuestro equipo está conformado por veterinarios especialistas con formación 
            internacional y certificaciones de las más prestigiosas instituciones.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                {stat.icon}
              </div>
              <div className="text-2xl font-black text-orange-400 mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 border border-white/10"
            >
              {/* Image */}
              <div className="relative mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto border-3 border-white/20 group-hover:border-orange-400/50 transition-all duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors duration-300">
                  {member.name}
                </h3>
                
                <div className="text-orange-400 font-semibold mb-2 text-sm">
                  {member.specialty}
                </div>
                
                <div className="text-gray-300 text-xs mb-3">
                  {member.experience} de experiencia
                </div>
                
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  {member.description}
                </p>

                {/* Education */}
                <div className="mb-3">
                  <h4 className="text-white font-semibold mb-1 flex items-center justify-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4" />
                    Formación
                  </h4>
                  <p className="text-gray-400 text-xs">{member.education}</p>
                </div>

                {/* Certifications */}
                <div className="mb-4">
                  <h4 className="text-white font-semibold mb-2 flex items-center justify-center gap-2 text-sm">
                    <Award className="w-4 h-4" />
                    Certificaciones
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.certifications.map((cert, certIndex) => (
                      <span
                        key={certIndex}
                        className="bg-white/10 text-white text-xs px-2 py-1 rounded-full border border-white/20"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-gradient-to-r from-orange-400 to-red-400 text-white py-2 px-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm">
                  Agendar Consulta
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">
            ¿Quieres conocer más sobre nuestro equipo?
          </h3>
          <p className="text-lg mb-6 opacity-90 max-w-xl mx-auto">
            Agenda una consulta y conoce personalmente a nuestros especialistas. 
            Cada uno está comprometido con el bienestar de tu mascota.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/573127396409"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <span>📱</span>
              <span>Contactar Equipo</span>
            </a>
            <a
              href="#servicios"
              className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <span>📅</span>
              <span>Ver Servicios</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;