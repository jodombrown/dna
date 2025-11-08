import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/typography.config';

const WhoIsDNAForSection = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Connect with diaspora professionals across the globe",
      answer: "Build meaningful relationships with African diaspora professionals worldwide. Our platform enables you to discover and network with leaders, innovators, and changemakers who share your commitment to Africa's development."
    },
    {
      question: "Find impact opportunities in Africa",
      answer: "Explore curated opportunities to contribute your skills and expertise to transformative projects across the continent. From venture building to capacity development, discover pathways that match your passion and experience."
    },
    {
      question: "Build ventures that transform communities",
      answer: "Collaborate with fellow entrepreneurs and innovators to create scalable solutions addressing Africa's most pressing challenges. Access resources, mentorship, and partnerships to bring your vision to life."
    },
    {
      question: "Access capacity building and mentorship",
      answer: "Engage with experienced mentors and participate in structured programs designed to enhance your skills and amplify your impact. Learn from those who have successfully navigated the journey of diaspora-led innovation."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Who is DNA for? */}
        <div className="mb-12">
          <h2 className={`${TYPOGRAPHY.h2} text-dna-copper mb-4`}>
            Who is DNA for?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Anyone committed to Africa's transformation through innovation and entrepreneurship.
          </p>

          {/* FAQ Toggles */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all duration-200 text-left"
                >
                  <span className="text-gray-900 font-medium pr-4">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180 text-dna-copper' : ''
                    }`} 
                  />
                </button>
                {openIndex === index && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center">
          <h3 className={`${TYPOGRAPHY.h3} text-gray-900 mb-4`}>
            Join the African diaspora movement
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect with visionary leaders, builders, and changemakers dedicated to accelerating Africa's development.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3"
          >
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhoIsDNAForSection;
