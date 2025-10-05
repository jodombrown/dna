import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';
import { OnboardingGuard } from '@/components/auth/OnboardingGuard';

// Core pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import InviteSignup from "./pages/InviteSignup";
import UserDashboard from "./pages/UserDashboard";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ProfilePage from "./pages/ProfilePage";
import ProfileEdit from "./pages/ProfileEdit";
import TestProfileChecklist from "./pages/TestProfileChecklist";

// Static pages  
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Example pages
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import Contribute from "./pages/Contribute";
import OrganizationDetail from "./pages/OrganizationDetail";
import EventCategoryPage from "./pages/app/EventCategoryPage";

// Regional pages
import NorthAfricaLandingPage from "./pages/NorthAfricaLandingPage";

// Phase pages
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";


const queryClient = new QueryClient();

// Auth guard component to prevent authenticated users from accessing auth-specific pages only
const AuthGuard = ({ children, redirectAuth = false }: { children: React.ReactNode; redirectAuth?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // Only redirect authenticated users if this is an auth-specific page
  if (user && redirectAuth) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AppShell = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    {children}
  </AuthGuard>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Public auth routes - no guard */}
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/invite" element={<InviteSignup />} />
              
              {/* Protected routes - ALL wrapped with OnboardingGuard */}
              <Route path="/" element={<OnboardingGuard><Index /></OnboardingGuard>} />
              
              {/* User profiles */}
              <Route path="/dna/:username" element={<OnboardingGuard><UserDashboard /></OnboardingGuard>} />
              <Route path="/profile/:username" element={<OnboardingGuard><ProfilePage /></OnboardingGuard>} />
              <Route path="/profile/:username/edit" element={<OnboardingGuard><ProfileEdit /></OnboardingGuard>} />
              <Route path="/test-profile-checklist" element={<OnboardingGuard><TestProfileChecklist /></OnboardingGuard>} />
              
              {/* Main feature pages */}
              <Route path="/connect" element={<OnboardingGuard><ConnectExample /></OnboardingGuard>} />
              <Route path="/collaborate" element={<OnboardingGuard><CollaborationsExample /></OnboardingGuard>} />
              <Route path="/contribute-old" element={<OnboardingGuard><ContributeExample /></OnboardingGuard>} />
              <Route path="/contribute" element={<OnboardingGuard><Contribute /></OnboardingGuard>} />
              <Route path="/org/:slug" element={<OnboardingGuard><OrganizationDetail /></OnboardingGuard>} />
              
              {/* Event category pages */}
              <Route path="/events/category/:slug" element={<OnboardingGuard><EventCategoryPage /></OnboardingGuard>} />
              
              {/* Regional landing pages */}
              <Route path="/north-africa" element={<OnboardingGuard><NorthAfricaLandingPage /></OnboardingGuard>} />
              
              {/* Phase pages */}
              <Route path="/phase-1/market-research" element={<OnboardingGuard><MarketResearchPhase /></OnboardingGuard>} />
              <Route path="/phase-2/prototyping" element={<OnboardingGuard><PrototypingPhase /></OnboardingGuard>} />
              <Route path="/phase-3/customer-discovery" element={<OnboardingGuard><CustomerDiscoveryPhase /></OnboardingGuard>} />
              <Route path="/phase-4/mvp" element={<OnboardingGuard><MvpPhase /></OnboardingGuard>} />
              <Route path="/phase-5/beta-validation" element={<OnboardingGuard><BetaValidationPhase /></OnboardingGuard>} />
              <Route path="/phase-6/go-to-market" element={<OnboardingGuard><GoToMarketPhase /></OnboardingGuard>} />
              
              {/* Static pages - public access */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BadgeToastListener />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;