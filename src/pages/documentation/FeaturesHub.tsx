import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { features, FeaturePillar } from "@/config/features.config";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const pillars: (FeaturePillar | "All")[] = ["All", "Connect", "Convene", "Collaborate", "Contribute", "Convey", "Platform"];

export default function FeaturesHub() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPillar, setSelectedPillar] = useState<FeaturePillar | "All">("All");

  const filteredFeatures = features
    .filter((feature) => {
      const matchesSearch =
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.pillar.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.shortTagline.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPillar = selectedPillar === "All" || feature.pillar === selectedPillar;

      return matchesSearch && matchesPillar;
    })
    .sort((a, b) => a.overviewOrder - b.overviewOrder);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-dna-emerald text-white";
      case "beta":
        return "bg-dna-copper text-white";
      case "coming-soon":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-dna-forest to-dna-emerald text-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Explore DNA Features</h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed">
            When you step into DNA, you're entering a global ecosystem built to help the African diaspora connect, collaborate, convene, contribute, and share our stories. This page is your guide to everything you can do here — every tool, every capability, every way to participate.
          </p>
          <p className="text-base text-white/80 mt-4">
            Whether you're new or returning, this hub helps you quickly understand how DNA works and how to put its features to use.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Why this page exists */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Why This Page Exists</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="text-lg leading-relaxed">
              DNA is big. You shouldn't have to guess how it works.
              This page explains each major feature, why it matters, and how to use it — in simple, clear language.
              Click any feature to see a full deep-dive guide.
            </p>
            <p className="mt-4">
              <strong className="text-foreground">This helps:</strong> Members, Organizers, Contributors, Partners, Investors, and Curious Visitors — everyone understands what DNA actually is.
            </p>
          </div>
        </section>

        {/* How to use this page */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">How to Use This Page</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <ul className="space-y-2 list-disc pl-6">
              <li>Browse the list of features below</li>
              <li>Filter by the 5Cs or by system features</li>
              <li>Click any feature to see how it works and how to use it</li>
              <li>Check back often — we update this page as DNA evolves</li>
            </ul>
          </div>
        </section>

        {/* Search and Filters */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Find what matters to you</h2>
          <p className="text-muted-foreground mb-6">
            Type a keyword like "events", "funding", or "spaces" in the search bar. Use the filters to focus on a
            specific pillar of DNA. You can combine search + filters to narrow things down quickly.
          </p>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {pillars.map((pillar) => (
                <button
                  key={pillar}
                  onClick={() => setSelectedPillar(pillar)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPillar === pillar
                      ? "bg-dna-emerald text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {pillar}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {filteredFeatures.length} {filteredFeatures.length === 1 ? "Feature" : "Features"}
          </h2>
          
          {filteredFeatures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No features found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature) => (
                <Card key={feature.slug} className="flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={getStatusColor(feature.status)}>
                        {feature.status === "live" ? "Live" : feature.status === "beta" ? "Beta" : "Coming Soon"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.name}</CardTitle>
                    <CardDescription className="text-base">{feature.shortTagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <p className="text-sm text-muted-foreground mb-4">{feature.oneLiner}</p>
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        <strong>For:</strong> {feature.audience.join(", ")}
                      </p>
                      <Link
                        to={`/documentation/features/${feature.slug}`}
                        className="inline-block text-dna-emerald hover:text-dna-forest font-medium text-sm"
                      >
                        Learn how it works →
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
