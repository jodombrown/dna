
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-dna-forest to-dna-emerald text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Connect. Collaborate. 
              <span className="text-dna-gold"> Contribute.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Join the premier professional network for the African Diaspora. 
              Together, we're building bridges to Africa's bright future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-dna-copper hover:bg-dna-gold text-white text-lg px-8 py-3"
              >
                Join the Network
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-dna-forest text-lg px-8 py-3"
              >
                Explore DNA
              </Button>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="w-12 h-12 bg-dna-gold rounded-full mb-4"></div>
                  <h3 className="font-semibold mb-2">500K+</h3>
                  <p className="text-sm text-gray-200">Diaspora Professionals</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="w-12 h-12 bg-dna-copper rounded-full mb-4"></div>
                  <h3 className="font-semibold mb-2">1,200+</h3>
                  <p className="text-sm text-gray-200">Active Projects</p>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="w-12 h-12 bg-dna-mint rounded-full mb-4"></div>
                  <h3 className="font-semibold mb-2">54</h3>
                  <p className="text-sm text-gray-200">African Countries</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="w-12 h-12 bg-white rounded-full mb-4"></div>
                  <h3 className="font-semibold mb-2">$2.5B+</h3>
                  <p className="text-sm text-gray-200">Impact Generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
