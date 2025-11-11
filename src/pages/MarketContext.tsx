import { useScrollToTop } from "@/hooks/useScrollToTop";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";
import { Users, TrendingUp, DollarSign, Globe, Target, AlertCircle, Briefcase, GraduationCap, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const MarketContext = () => {
  useScrollToTop();

  const marketSegments = [
    {
      name: "African Diaspora Professionals",
      size: "140M+ globally",
      growth: "3.2% annually",
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      name: "African Entrepreneurs",
      size: "44M+ businesses",
      growth: "5.8% annually",
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      name: "Diaspora Investors",
      size: "$40B+ remittances",
      growth: "7.2% annually",
      icon: DollarSign,
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      name: "African Students Abroad",
      size: "500K+ students",
      growth: "4.5% annually",
      icon: GraduationCap,
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  const marketTrends = [
    {
      trend: "Digital Transformation in Africa",
      stat: "65% growth in internet penetration (2020-2024)",
      impact: "Creating new opportunities for digital platforms to connect diaspora",
      progress: 65
    },
    {
      trend: "Diaspora Investment Appetite",
      stat: "$200B+ diaspora wealth seeking Africa opportunities",
      impact: "Growing demand for vetted investment and collaboration channels",
      progress: 78
    },
    {
      trend: "Remote Work Revolution",
      stat: "42% of African professionals work remotely",
      impact: "Enabling global collaboration without geographical constraints",
      progress: 42
    },
    {
      trend: "Pan-African Identity Growth",
      stat: "89% of young diasporans identify strongly with African heritage",
      impact: "Driving cultural reconnection and economic engagement",
      progress: 89
    }
  ];

  const painPoints = [
    {
      icon: AlertCircle,
      title: "Fragmented Networks",
      description: "African diaspora professionals struggle to find and connect with relevant opportunities, collaborators, and mentors across dispersed communities.",
      severity: "Critical",
      affectedUsers: "85% of diaspora professionals"
    },
    {
      icon: Target,
      title: "Trust & Verification Gap",
      description: "Lack of credible platforms to verify opportunities, partnerships, and professional credentials creates barriers to meaningful collaboration.",
      severity: "High",
      affectedUsers: "72% of diaspora investors"
    },
    {
      icon: Globe,
      title: "Limited Access to Vetted Opportunities",
      description: "Entrepreneurs and professionals lack centralized access to vetted projects, funding, and partnership opportunities aligned with Africa's development.",
      severity: "High",
      affectedUsers: "68% of African entrepreneurs"
    },
    {
      icon: Heart,
      title: "Cultural Disconnection",
      description: "Second and third-generation diasporans seek meaningful ways to reconnect with African heritage beyond tourism and superficial engagement.",
      severity: "Medium",
      affectedUsers: "91% of young diasporans"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Market Context & Opportunity
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Understanding the landscape, challenges, and opportunities that DNA addresses 
              in connecting the African diaspora with Africa's development ecosystem.
            </p>
          </div>
        </div>
      </section>

      {/* Target Market Segments */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">Target Market Segments</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            DNA serves four primary segments within the African diaspora and continental ecosystem, 
            collectively representing a $240B+ economic opportunity.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {marketSegments.map((segment, index) => {
              const Icon = segment.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${segment.bgColor}`}>
                      <Icon className={`w-8 h-8 ${segment.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{segment.name}</h3>
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-primary">{segment.size}</p>
                        <p className="text-sm text-muted-foreground">
                          Growing at <span className="font-semibold text-accent">{segment.growth}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border">
            <h3 className="text-2xl font-bold mb-4 text-center">Combined Market Potential</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">185M+</p>
                <p className="text-muted-foreground">Total Addressable Users</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent mb-2">$240B+</p>
                <p className="text-muted-foreground">Economic Opportunity</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-secondary mb-2">5.1%</p>
                <p className="text-muted-foreground">Average Annual Growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Trends */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">Key Market Trends</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Converging trends creating unprecedented opportunity for diaspora-Africa engagement platforms.
          </p>
          
          <div className="space-y-6">
            {marketTrends.map((trend, index) => (
              <Card key={index} className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{trend.trend}</h3>
                      <p className="text-lg font-bold text-primary mb-2">{trend.stat}</p>
                    </div>
                    <div className="text-3xl font-bold text-accent">{trend.progress}%</div>
                  </div>
                  <Progress value={trend.progress} className="h-2 mb-3" />
                  <p className="text-muted-foreground">{trend.impact}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pain Points & Challenges */}
      <section className="py-16 px-6 bg-background">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-center">Pain Points DNA Addresses</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            Critical challenges facing the African diaspora that prevent meaningful engagement 
            with Africa's development and economic opportunities.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {painPoints.map((pain, index) => {
              const Icon = pain.icon;
              const severityColor = 
                pain.severity === "Critical" ? "text-destructive" : 
                pain.severity === "High" ? "text-orange-500" : "text-yellow-500";
              
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <Icon className="w-6 h-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{pain.title}</h3>
                        <span className={`text-sm font-semibold ${severityColor}`}>
                          {pain.severity}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{pain.description}</p>
                      <p className="text-sm font-medium text-primary">
                        Affects: {pain.affectedUsers}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-12 p-8 bg-gradient-to-br from-destructive/5 to-orange-500/5 rounded-lg border border-destructive/20">
            <h3 className="text-2xl font-bold mb-4 text-center">The DNA Solution</h3>
            <p className="text-center text-lg text-muted-foreground max-w-3xl mx-auto">
              DNA addresses these pain points by creating a trusted, AI-powered platform that connects 
              diaspora professionals, entrepreneurs, and investors with vetted opportunities, collaborators, 
              and projects aligned with Africa's sustainable development, turning fragmentation into 
              a unified network for impact and growth.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MarketContext;