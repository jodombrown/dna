
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TestimonialCard = ({ quote, author, title, image }: {
  quote: string;
  author: string;
  title: string;
  image: string;
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg min-h-[200px] flex flex-col justify-between">
    <blockquote className="text-lg italic text-gray-700 mb-4 flex-grow">
      "{quote}"
    </blockquote>
    <div className="flex items-center gap-4">
      <img src={image} alt={author} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <div className="font-semibold text-dna-forest">{author}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  </div>
);

const TestimonialsCarousel = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "I launched my agritech startup with support from the diaspora network. Today, we're transforming farming across West Africa.",
      author: "Ngozi Adebayo",
      title: "CEO, FarmTech Solutions",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "My remittances now fund a solar energy project that powers 50 schools in rural Kenya. This is the impact we can create together.",
      author: "Samuel Thompson",
      title: "Architect & Impact Investor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The diaspora network connected me with mentors who helped scale my fintech company from idea to serving 100k+ users.",
      author: "Amara Diallo",
      title: "Founder, PayConnect Africa",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-dna-forest mb-4">Real Voices</h3>
        <p className="text-lg text-gray-600">Stories from diaspora changemakers</p>
      </div>
      
      <div className="relative bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="icon"
            onClick={prevTestimonial}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 mx-8">
            <TestimonialCard {...testimonials[currentTestimonial]} />
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextTestimonial}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentTestimonial(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentTestimonial ? 'bg-dna-emerald' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
