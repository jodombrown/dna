import React from 'react';

interface UserActionPreviewsSectionProps {
  title: string;
  updates: string[];
}

const UserActionPreviewsSection: React.FC<UserActionPreviewsSectionProps> = ({ title, updates }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-dna-copper/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            {title}
          </h2>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {updates.map((update, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg hover:from-dna-emerald/10 hover:to-dna-copper/10 transition-all duration-300">
                <div className="flex-shrink-0 w-2 h-2 bg-dna-emerald rounded-full mt-3"></div>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {update}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserActionPreviewsSection;