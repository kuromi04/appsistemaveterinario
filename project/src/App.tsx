import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Specialties from './components/Specialties';
import Team from './components/Team';
import CTA from './components/CTA';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';

function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Services />
      <Specialties />
      <Team />
      <CTA />
      <Footer />
      <AIAssistant />
    </div>
  );
}

export default App;