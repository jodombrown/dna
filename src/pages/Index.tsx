
import HeroSection from "@/components/HeroSection";
import FeaturedMembers from "@/components/FeaturedMembers";
import ProjectPathways from "@/components/ProjectPathways";
import ImpactShowcase from "@/components/ImpactShowcase";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedMembers />
      <ProjectPathways />
      <ImpactShowcase />
      <Footer />
    </div>
  );
};

export default Index;
