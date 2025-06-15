
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
      <section className="mb-8 space-y-4 text-lg text-gray-800">
        <p>
          <span className="font-semibold text-dna-copper">Diaspora Network of Africa (DNA)</span> is a community-powered platform with a bold vision:
          to connect, empower, and mobilize Africa’s global diaspora for professional, entrepreneurial, and social impact back home and worldwide.
        </p>
        <p>
          DNA brings together Africans and those passionate about Africa—regardless of where they live—to collaborate, innovate, and support each other in meaningful ways. 
          Our community includes experienced professionals, entrepreneurs, students, investors, and changemakers from every corner of the continent and the globe.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-dna-forest mb-2">Our Mission</h2>
        <p className="text-lg text-gray-800">
          DNA's mission is to accelerate Africa’s renaissance by harnessing the talent, resources, and ingenuity of its diaspora and friends.
          We aim to break down barriers, foster trusted networks, and create new pathways for investment, mentorship, and collective problem-solving.
        </p>
      </section>
      
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-dna-forest mb-2">Why DNA?</h2>
        <ul className="list-disc list-inside text-lg text-gray-800 space-y-2">
          <li>
            <span className="font-bold text-dna-copper">Community First:</span> DNA is built by and for its community—we listen, iterate, and co-create, ensuring that your needs and aspirations lead the way.
          </li>
          <li>
            <span className="font-bold text-dna-copper">Radical Collaboration:</span> We unite Africans across borders and generations, building bridges between the continent and the world’s diaspora, to multiply our collective impact.
          </li>
          <li>
            <span className="font-bold text-dna-copper">Empowering Change:</span> DNA is the launchpad for projects, ventures, partnerships, and movements that matter for Africa’s growth and global influence.
          </li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-2xl font-semibold text-dna-forest mb-2">Join the Journey</h2>
        <p className="text-lg text-gray-800 mb-3">
          Whether you want to give back, find collaborators, access opportunities, or simply connect with like-minded people,
          DNA invites you to help us shape the future.
        </p>
        <p className="text-lg text-gray-800">
          <span className="font-semibold">We are stronger together.</span> Welcome to the movement.
        </p>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;

