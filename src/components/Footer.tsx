
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6 lg:py-8">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0">
          {/* Copyright and Documentation Link */}
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-gray-400 text-sm">
              © 2025 DNA - Diaspora Network of Africa. All rights reserved.
            </p>
            <Link 
              to="/documentation/features" 
              className="text-gray-400 hover:text-dna-copper transition-colors text-sm inline-block mt-1"
            >
              DNA | Documentation Hub
            </Link>
          </div>

          {/* Social Media Links */}
          <div className="flex items-center space-x-6">
            <a
              href="https://www.linkedin.com/company/diasporanetworkafrica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-dna-copper transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
