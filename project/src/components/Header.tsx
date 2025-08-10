import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, MessageCircle, Calendar, Heart } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Inicio', href: '#inicio' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Especialidades', href: '#especialidades' },
    { name: 'Equipo', href: '#equipo' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'glass-card shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 group">
            <img 
              src="/Animal Sweet.png" 
              alt="Animal Sweet Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover group-hover:scale-110 transition-transform duration-300 animate-glow shadow-lg"
            />
            <div>
              <h1 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                isScrolled ? 'text-gray-800' : 'text-white'
              }`}>
                Animal Sweet
              </h1>
              <p className={`text-xs sm:text-sm transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-gray-300'
              }`}>
                Clínica Veterinaria
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`font-medium transition-all duration-300 hover:text-green-500 hover:scale-105 relative group ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="tel:+573012908253"
              className={`p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isScrolled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'glass-card text-white hover:bg-white/30'
              }`}
            >
              <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://wa.me/573012908253"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 ${
                isScrolled 
                  ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                  : 'glass-card text-white hover:bg-white/30'
              }`}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="#servicios"
              className="btn-modern bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendar Cita</span>
              <span className="sm:hidden">Cita</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/20'
            }`}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-500 overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="glass-card rounded-2xl mt-4 p-4 shadow-xl">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+573012908253"
                  className="btn-modern bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Llamar
                </a>
                <a
                  href="https://wa.me/573012908253"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-modern bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl text-center font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;