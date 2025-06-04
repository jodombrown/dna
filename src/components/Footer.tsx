
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Section */}
        <div className="py-12 border-b border-gray-800">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                Stay Connected with <span className="text-africa-orange">DiasporaLink</span>
              </h3>
              <p className="text-gray-300">
                Get weekly updates on opportunities, events, and success stories from our community.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="bg-gray-800 border-gray-700 text-white flex-1"
              />
              <Button className="bg-africa-orange hover:bg-africa-sunset text-white px-8">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-africa-gold">DiasporaLink</h3>
            <p className="text-gray-300 mb-4">
              Connecting the African Diaspora to drive progress across the continent through 
              professional networking and collaborative impact.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-africa-orange rounded-full"></div>
              <div className="w-8 h-8 bg-africa-gold rounded-full"></div>
              <div className="w-8 h-8 bg-africa-green rounded-full"></div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-africa-gold">Platform</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-africa-orange transition-colors">Find Members</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Join Groups</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Browse Projects</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Event Calendar</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Resource Hub</a></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4 text-africa-gold">Community</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-africa-orange transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Mentorship</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Career Center</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Investment Board</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Africa Connect</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-africa-gold">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-africa-orange transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-africa-orange transition-colors">About Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 DiasporaLink. Building bridges to Africa's future.
          </p>
          <p className="text-gray-400 text-sm">
            Made with ❤️ for the African Diaspora
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
