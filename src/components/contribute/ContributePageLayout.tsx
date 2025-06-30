
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ContributePageLayoutProps {
  children: React.ReactNode;
}

const ContributePageLayout: React.FC<ContributePageLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ContributePageLayout;
