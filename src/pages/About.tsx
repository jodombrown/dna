import React from 'react';
import Header from '@/components/Header';
import PrototypeBanner from '@/components/PrototypeBanner';
import Footer from '@/components/Footer';

const About = () => (
  <div className="min-h-screen bg-white">
    <Header />
    <PrototypeBanner />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <h1 className="text-4xl font-bold text-dna-forest mb-6">About DNA</h1>
      
    </main>
    <Footer />
  </div>
);

export default About;
