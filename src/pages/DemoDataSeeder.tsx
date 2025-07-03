import React from 'react';
import Header from '@/components/Header';
import DemoDataSeeder from '@/components/admin/DemoDataSeeder';

const DemoDataSeederPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            DNA Platform Demo Data
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create comprehensive demo data to fully test and experience all features of the DNA platform. 
            Perfect for testing the user experience across all pillars: Connect, Collaborate, and Contribute.
          </p>
        </div>
        
        <DemoDataSeeder />
      </div>
    </div>
  );
};

export default DemoDataSeederPage;