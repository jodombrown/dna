import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Globe, Sparkles, BookOpen } from 'lucide-react';
import overviewImage from '@/assets/north-africa-overview.jpg';
import diasporaImage from '@/assets/diaspora-connection.jpg';

const CulturalNarrative = () => {
  const culturalHighlights = [
    {
      title: "Ancient Wisdom, Modern Innovation",
      description: "From the pyramids of Egypt to Morocco's medinas, North Africa combines millennia of wisdom with cutting-edge innovation, creating unique opportunities for diaspora-led development.",
      icon: Sparkles,
      color: "dna-emerald"
    },
    {
      title: "Crossroads of Continents",
      description: "Strategically positioned between Africa, Europe, and the Middle East, the region serves as a natural bridge for diaspora communities to create global impact.",
      icon: Globe,
      color: "north-africa-terracotta"
    },
    {
      title: "Ubuntu & Collective Progress",
      description: "The philosophy of Ubuntu - 'I am because we are' - drives collaborative approaches to economic development, making diaspora contributions more impactful.",
      icon: Heart,
      color: "dna-copper"
    },
    {
      title: "Knowledge Heritage",
      description: "Home to Al-Azhar, the University of Fez, and countless centers of learning, the region's intellectual tradition creates fertile ground for innovation and research partnerships.",
      icon: BookOpen,
      color: "north-africa-oasis"
    }
  ];

  const impactStories = [
    {
      title: "Moroccan Diaspora Solar Initiative",
      description: "A consortium of Moroccan engineers in Europe partnered with local communities to install 50MW of solar capacity across rural villages, providing clean energy to 25,000 people.",
      impact: "25,000 people powered",
      location: "Rural Morocco",
      type: "Energy Access"
    },
    {
      title: "Egyptian Tech Hub Alexandria",
      description: "Egyptian-American entrepreneurs established a tech incubator in Alexandria, supporting 120+ startups and creating over 800 jobs in the technology sector.",
      impact: "800+ jobs created",
      location: "Alexandria, Egypt",
      type: "Innovation"
    },
    {
      title: "Tunisian Olive Oil Cooperative",
      description: "Diaspora investment helped modernize traditional olive oil production, increasing income for 300 farming families by 40% while maintaining organic certification.",
      impact: "300 families impacted",
      location: "Kairouan, Tunisia",
      type: "Agriculture"
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-dna-mint/5 via-background to-north-africa-sand/10">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-3 w-12 bg-gradient-to-r from-dna-emerald to-dna-copper rounded-full" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              Beyond Numbers: The Heart of North Africa
            </h2>
            <div className="h-3 w-12 bg-gradient-to-r from-dna-copper to-north-africa-terracotta rounded-full" />
          </div>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Discover the rich cultural tapestry, visionary spirit, and deep-rooted values that make North Africa 
            a powerful force for global progress. This is where ancient wisdom meets diaspora innovation.
          </p>
        </div>

        {/* Cultural Highlights */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {culturalHighlights.map((highlight, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/60 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div 
                  className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `hsl(var(--${highlight.color}) / 0.1)` }}
                >
                  <highlight.icon 
                    className="h-8 w-8" 
                    style={{ color: `hsl(var(--${highlight.color}))` }}
                  />
                </div>
                <h3 className="font-semibold text-dna-forest mb-3">{highlight.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visual Story Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
              <img 
                src={overviewImage} 
                alt="North Africa Cultural Heritage" 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dna-forest/80 via-dna-forest/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <Badge className="bg-white/20 text-white border-white/30 mb-2">Cultural Heritage</Badge>
                <h3 className="text-xl font-semibold mb-2">Timeless Beauty, Modern Potential</h3>
                <p className="text-sm opacity-90">Where ancient architecture inspires sustainable innovation</p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">
                A Region Shaped by Resilience & Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For millennia, North Africa has been a crossroads of civilizations, trade routes, and ideas. 
                Today, this legacy of connection and exchange positions the region uniquely for diaspora-led 
                economic transformation.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From the entrepreneurial spirit of Carthaginian traders to the academic excellence of 
                medieval Islamic universities, the region's DNA of innovation creates fertile ground for 
                21st-century partnerships between diaspora communities and local enterprises.
              </p>
            </div>
            <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-lg p-6 border border-dna-emerald/20">
              <blockquote className="text-dna-forest font-medium italic mb-3">
                "The wealth of Africa is not just in its minerals and resources, but in the wisdom, 
                resilience, and innovative spirit of its people, both at home and in the diaspora."
              </blockquote>
              <cite className="text-sm text-muted-foreground">Ancient African Proverb, Modern Application</cite>
            </div>
          </div>
        </div>

        {/* Impact Stories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-dna-forest mb-4">
              Stories of Transformation
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Real impact happens when diaspora hearts meet local needs. These stories showcase the power 
              of cultural connection combined with global expertise and resources.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {impactStories.map((story, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-dna-emerald to-dna-copper" />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className="border-dna-emerald text-dna-emerald">
                      {story.type}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{story.location}</p>
                    </div>
                  </div>
                  <h4 className="font-semibold text-dna-forest mb-3 group-hover:text-dna-emerald transition-colors">
                    {story.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {story.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-dna-emerald">{story.impact}</p>
                      <p className="text-xs text-muted-foreground">Direct Impact</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-dna-copper hover:text-dna-emerald">
                      Read More
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Diaspora Connection Visual */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={diasporaImage} 
            alt="Diaspora Connection and Unity" 
            className="w-full h-64 md:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dna-forest/90 via-dna-forest/60 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  Diaspora Connection
                </Badge>
                <h3 className="text-3xl font-bold text-white mb-4">
                  Your Heritage, Your Impact, Your Future
                </h3>
                <p className="text-white/90 leading-relaxed mb-6">
                  Whether you're in London, New York, Paris, or anywhere in between, your connection to 
                  North Africa creates opportunities for meaningful impact. Explore how your skills, 
                  networks, and resources can drive positive change while honoring your roots.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="bg-dna-emerald hover:bg-dna-emerald/90 text-white">
                    <Heart className="mr-2 h-4 w-4" />
                    Start Your Impact Journey
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-dna-forest">
                    Share Your Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CulturalNarrative;