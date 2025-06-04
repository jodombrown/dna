
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Users, MessageSquare } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-africa-green">DiasporaLink</h1>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search professionals, companies, or opportunities..."
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-africa-orange transition-colors flex flex-col items-center py-2">
              <User className="h-5 w-5 mb-1" />
              <span className="text-xs">Profile</span>
            </a>
            <a href="#" className="text-gray-700 hover:text-africa-orange transition-colors flex flex-col items-center py-2">
              <Users className="h-5 w-5 mb-1" />
              <span className="text-xs">Network</span>
            </a>
            <a href="#" className="text-gray-700 hover:text-africa-orange transition-colors flex flex-col items-center py-2">
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs">Messages</span>
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" className="border-africa-orange text-africa-orange hover:bg-africa-orange hover:text-white">
              Sign In
            </Button>
            <Button className="bg-africa-orange hover:bg-africa-sunset text-white">
              Join Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <div className="pb-3">
              <Input
                type="text"
                placeholder="Search..."
                className="w-full"
              />
            </div>
            <a href="#" className="block py-2 text-gray-700">Profile</a>
            <a href="#" className="block py-2 text-gray-700">Network</a>
            <a href="#" className="block py-2 text-gray-700">Messages</a>
            <div className="pt-3 space-y-2">
              <Button variant="outline" className="w-full border-africa-orange text-africa-orange">
                Sign In
              </Button>
              <Button className="w-full bg-africa-orange hover:bg-africa-sunset text-white">
                Join Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
