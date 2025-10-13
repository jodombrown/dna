
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PatternBackground from '@/components/ui/PatternBackground';

const ImpactShowcase = () => {
  const stats = [
    {
      number: "$2.5B+",
      label: "Economic Impact Generated",
      description: "Through diaspora investments and projects"
    },
    {
      number: "500K+",
      label: "Lives Transformed",
      description: "Across 54 African countries"
    },
    {
      number: "1,200+",
      label: "Active Projects",
      description: "Driving sustainable development"
    },
    {
      number: "150+",
      label: "Countries Represented",
      description: "In our global diaspora network"
    }
  ];

  const projects = [
    {
      title: "Solar Education Initiative",
      location: "Rural Kenya",
      impact: "50 schools powered",
      funding: "$2.3M raised",
      category: "Education",
      status: "Active"
    },
    {
      title: "AgriTech Market Platform",
      location: "West Africa",
      impact: "10,000 farmers connected",
      funding: "$5.1M raised",
      category: "Agriculture",
      status: "Expanding"
    },
    {
      title: "Healthcare Mobile Clinics",
      location: "Eastern Africa",
      impact: "100,000 patients served",
      funding: "$3.8M raised",
      category: "Healthcare",
      status: "Scaling"
    }
  ];

  return (
    <PatternBackground pattern="adinkra" intensity="subtle" className="py-16 bg-dna-emerald text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our Collective <span className="text-dna-gold">Impact</span>
          </h2>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto">
            Together, we're creating measurable change across Africa through innovation, investment, and collaboration
          </p>
        </div>

        {/* Impact Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors">
                <div className="text-3xl md:text-4xl font-bold text-dna-gold mb-2">
                  {stat.number}
                </div>
                <div className="text-lg font-semibold mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-200">
                  {stat.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Projects */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-dna-gold">
            Featured Impact Projects
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant="secondary" className="bg-dna-copper text-white">
                      {project.category}
                    </Badge>
                    <Badge variant="outline" className="border-dna-gold text-dna-gold">
                      {project.status}
                    </Badge>
                  </div>
                  
                  <h4 className="text-lg font-semibold mb-2 text-white">
                    {project.title}
                  </h4>
                  
                  <p className="text-gray-200 mb-4">
                    {project.location}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Impact:</span>
                      <span className="text-dna-gold font-medium">{project.impact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Funding:</span>
                      <span className="text-dna-gold font-medium">{project.funding}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PatternBackground>
  );
};

export default ImpactShowcase;
