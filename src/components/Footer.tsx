
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, HelpCircle, Mail, Info, Users, Briefcase, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
          
          {/* DNA Platform */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3">Platform</h3>
            <nav className="space-y-1 md:space-y-2">
              <Link 
                to="/connect" 
                className="group flex items-center text-gray-400 hover:text-dna-emerald transition-colors duration-200"
              >
                <Users className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Connect</span>
              </Link>
              <Link 
                to="/collaborate" 
                className="group flex items-center text-gray-400 hover:text-dna-emerald transition-colors duration-200"
              >
                <Briefcase className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Collaborate</span>
              </Link>
              <Link 
                to="/contribute" 
                className="group flex items-center text-gray-400 hover:text-dna-emerald transition-colors duration-200"
              >
                <Heart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Contribute</span>
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3">Resources</h3>
            <nav className="space-y-1 md:space-y-2">
              <Link 
                to="/help" 
                className="group flex items-center text-gray-400 hover:text-dna-copper transition-colors duration-200"
              >
                <HelpCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Help Center</span>
              </Link>
              <Link 
                to="/about" 
                className="group flex items-center text-gray-400 hover:text-dna-copper transition-colors duration-200"
              >
                <Info className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">About DNA</span>
              </Link>
              <Link 
                to="/contact" 
                className="group flex items-center text-gray-400 hover:text-dna-copper transition-colors duration-200"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Contact Us</span>
              </Link>
              <a 
                href="mailto:aweh@diasporanetwork.africa"
                className="group flex items-center text-gray-400 hover:text-dna-copper transition-colors duration-200"
              >
                <Mail className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">aweh@diasporanetwork.africa</span>
              </a>
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3">Community</h3>
            <nav className="space-y-1 md:space-y-2">
              <a
                href="https://www.linkedin.com/company/diasporanetworkafrica"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center text-gray-400 hover:text-dna-gold transition-colors duration-200"
              >
                <Linkedin className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/diasporanetwork.africa"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center text-gray-400 hover:text-dna-gold transition-colors duration-200"
              >
                <Instagram className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="story-link">Instagram</span>
              </a>
              <a
                href="https://www.reddit.com/r/diasporanetworkafrica/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center text-gray-400 hover:text-dna-gold transition-colors duration-200"
              >
                <div className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </div>
                <span className="story-link">Reddit</span>
              </a>
            </nav>
          </div>

          {/* Mission */}
          <div className="col-span-2 md:col-span-1 space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-white mb-2 md:mb-3">Our Mission</h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
              Empowering the global African diaspora to Connect, Collaborate, and Contribute toward Africa's sustainable development.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-xs md:text-sm">
                © 2025 DNA - Diaspora Network of Africa. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs md:text-sm">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Platform Online</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
