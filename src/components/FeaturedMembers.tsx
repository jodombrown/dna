
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FeaturedMembers = () => {
  const members = [
    {
      name: "Amara Okafor",
      title: "Tech Executive & Innovation Strategist",
      location: "Lagos, Nigeria → San Francisco, USA",
      company: "FinTech Africa",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
      impact: "Launched 5 startups connecting African markets globally"
    },
    {
      name: "Kwame Asante",
      title: "Renewable Energy Engineer",
      location: "Accra, Ghana → Berlin, Germany",
      company: "Solar Solutions Inc",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      impact: "Brought clean energy to 50,000+ African households"
    },
    {
      name: "Zara Mbeki",
      title: "Investment Banker & Philanthropist",
      location: "Cape Town, SA → London, UK",
      company: "African Development Bank",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
      impact: "$50M invested in African infrastructure projects"
    },
    {
      name: "Ibrahim Hassan",
      title: "AgriTech Entrepreneur",
      location: "Cairo, Egypt → Toronto, Canada",
      company: "FarmConnect",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      impact: "Connected 10,000+ farmers to global markets"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our <span className="text-dna-copper">Network Leaders</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover professionals making extraordinary impact across Africa and the diaspora
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {members.map((member, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-20 h-20 rounded-full mb-4 object-cover border-4 border-dna-gold"
                  />
                  <h3 className="font-semibold text-lg mb-1 text-gray-900">{member.name}</h3>
                  <p className="text-dna-copper font-medium mb-2">{member.title}</p>
                  <p className="text-sm text-gray-600 mb-2">{member.company}</p>
                  <p className="text-xs text-gray-500 mb-3">{member.location}</p>
                  <div className="bg-dna-emerald/10 rounded-lg p-3 mb-4">
                    <p className="text-sm text-dna-emerald font-medium">{member.impact}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white w-full"
                  >
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-dna-copper hover:bg-dna-gold text-white"
          >
            View All Members
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMembers;
