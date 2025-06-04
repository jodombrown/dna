
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FeaturedMembers from '@/components/FeaturedMembers';
import CommunityGroups from '@/components/CommunityGroups';
import ImpactShowcase from '@/components/ImpactShowcase';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <FeaturedMembers />
      <CommunityGroups />
      <ImpactShowcase />
      <Footer />
    </div>
  );
};

export default Index;
