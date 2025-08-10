import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "María González",
      pet: "Luna (Golden Retriever)",
      rating: 5,
      text: "El Dr. Martínez salvó la vida de Luna cuando tuvo una emergencia cardíaca. Su profesionalismo y dedicación son excepcionales. El servicio a domicilio nos dio mucha tranquilidad.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Cardiología de Emergencia"
    },
    {
      name: "Carlos Rodríguez",
      pet: "Max (Pastor Alemán)",
      rating: 5,
      text: "Increíble atención para Max después de su cirugía de cadera. El seguimiento post-operatorio fue perfecto y ahora corre como antes. Totalmente recomendados.",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Traumatología"
    },
    {
      name: "Ana Martínez",
      pet: "Mimi (Gato Persa)",
      rating: 5,
      text: "La cirugía de cataratas de Mimi fue un éxito total. Ahora puede ver perfectamente. El equipo de oftalmología es excepcional y muy cariñoso con las mascotas.",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Oftalmología"
    },
    {
      name: "Roberto Silva",
      pet: "Rocky (Bulldog)",
      rating: 5,
      text: "El programa de medicina preventiva ha mantenido a Rocky saludable por años. Los chequeos regulares y las vacunas siempre a tiempo. Excelente servicio.",
      image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Medicina Preventiva"
    },
    {
      name: "Laura Fernández",
      pet: "Bella (Labrador)",
      rating: 5,
      text: "Cuando Bella tuvo problemas neurológicos, pensamos que era el final. Gracias al Dr. López y su equipo, Bella se recuperó completamente. Son ángeles.",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Neurología"
    },
    {
      name: "Diego Morales",
      pet: "Toby (Beagle)",
      rating: 5,
      text: "La atención de emergencia 24/7 salvó a Toby de una intoxicación. Llegaron a casa en 15 minutos y actuaron rápidamente. Profesionales de primera.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      service: "Medicina de Emergencias"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="w-4 h-4" />
            <span>TESTIMONIOS</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Lo que dicen
            </span>
            <br />
            <span className="text-gray-800">
              nuestros clientes
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            La satisfacción de nuestros clientes y el bienestar de sus mascotas 
            son nuestro mayor orgullo y motivación.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full translate-y-12 -translate-x-12"></div>
            
            {/* Quote Icon */}
            <div className="absolute top-8 left-8 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Quote className="w-6 h-6 text-white" />
            </div>

            <div className="relative z-10">
              {/* Content */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  {renderStars(testimonials[currentTestimonial].rating)}
                </div>
                
                <blockquote className="text-2xl lg:text-3xl font-medium text-gray-800 leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="text-left">
                    <div className="font-bold text-gray-800 text-lg">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-gray-600">
                      Dueño de {testimonials[currentTestimonial].pet}
                    </div>
                    <div className="text-sm text-blue-600 font-semibold">
                      {testimonials[currentTestimonial].service}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={prevTestimonial}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-400 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={nextTestimonial}
                  className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors duration-300"
                >
                  <ChevronRight className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                index === currentTestimonial ? 'ring-2 ring-yellow-400 scale-105' : 'hover:scale-105'
              }`}
              onClick={() => setCurrentTestimonial(index)}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.pet}</div>
                </div>
              </div>
              
              <div className="flex mb-3">
                {renderStars(testimonial.rating)}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {testimonial.text}
              </p>
              
              <div className="mt-3 text-xs text-blue-600 font-semibold">
                {testimonial.service}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-black mb-2">98%</div>
              <div className="text-lg opacity-90">Satisfacción</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">500+</div>
              <div className="text-lg opacity-90">Clientes Felices</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">5⭐</div>
              <div className="text-lg opacity-90">Calificación</div>
            </div>
            <div>
              <div className="text-4xl font-black mb-2">24/7</div>
              <div className="text-lg opacity-90">Disponibilidad</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;