import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
