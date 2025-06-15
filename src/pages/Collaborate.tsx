import React from "react";
import Header from "@/components/Header";
import PrototypeBanner from "@/components/PrototypeBanner";
import Footer from "@/components/Footer";
import CollaboratePage from "@/components/collaborate/CollaboratePage";

const Collaborate = () => (
  <div className="min-h-screen bg-white">
    <Header />
    <PrototypeBanner />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CollaboratePage />
    </main>
    <Footer />
  </div>
);

export default Collaborate;
