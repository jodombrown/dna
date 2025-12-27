/**
 * PublicProfileFooter Component
 *
 * Minimal footer for public profile pages.
 */

import { Link } from 'react-router-dom';

export const PublicProfileFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t mt-12 py-8 text-center text-sm text-muted-foreground">
      <div className="container max-w-4xl mx-auto px-4">
        <p>&copy; {currentYear} Diaspora Network of Africa. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link to="/privacy-policy" className="hover:underline hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link to="/terms-of-service" className="hover:underline hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link to="/about" className="hover:underline hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default PublicProfileFooter;
