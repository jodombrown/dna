
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Quote, ArrowRight, Users, TrendingUp } from 'lucide-react';

const UserSuccessSection = () => {
  const testimonials = [
    {
      name: "Amara Okafor",
      role: "Tech Entrepreneur, Lagos → Silicon Valley",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face",
      quote: "DNA connected me with three co-founders for my fintech startup. We're now processing $2M monthly across 5 African countries.",
      impact: "Raised $500K seed funding"
    },
    {
      name: "Dr. Kwame Asante",
      role: "Healthcare Innovation, Ghana → Toronto",
      image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face",
      quote: "Through DNA's network, I found the medical device expertise to scale our rural healthcare solution to 50+ communities.",
      impact: "Impacted 25,000+ patients"
    },
    {
      name: "Fatima Diallo",
      role: "Impact Investor, Senegal → London",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=150&h=150&fit=crop&crop=face",
      quote: "DNA's due diligence network helped me identify and fund 8 high-impact ventures. The collaborative approach is revolutionary.",
      impact: "Deployed $3.2M in impact capital"
    }
  ];

  const stats = [
    { number: "3,200+", label: "Early Members", trend: "+15% weekly" },
    { number: "180+", label: "Active Projects", trend: "65% success rate" },
    { number: "12", label: "Countries", trend: "Expanding monthly" },
    { number: "$2.1M", label: "Capital Mobilized", trend: "Last 6 months" }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Stats */}
        <div className="text-center mb-16">
          <Badge className="bg-dna-emerald/10 text-dna-emerald border-dna-emerald/20 mb-4">
            <TrendingUp className="w-4 h-4 mr-2" />
            Early Traction
          </Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Real Results from Real Members
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Join thousands of diaspora professionals already creating impact through meaningful connections and collaborative projects.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-dna-emerald mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium mb-1">{stat.label}</div>
                  <div className="text-sm text-dna-copper">{stat.trend}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <div className="flex items-center justify-center gap-3 mb-12">
            <Quote className="w-8 h-8 text-dna-copper" />
            <h3 className="text-3xl font-bold text-gray-900">Member Success Stories</h3>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <Badge className="bg-dna-mint/20 text-dna-forest border-dna-mint">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    {testimonial.impact}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserSuccessSection;
