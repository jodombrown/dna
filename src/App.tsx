import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';

// Core pages for networking platform
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import InviteSignup from "./pages/InviteSignup";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordComplete from "./pages/ResetPasswordComplete";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AuthCallback from "./pages/AuthCallback";
import UserDashboard from "./pages/UserDashboard";
import DnaMeRedirect from "./pages/DnaMeRedirect";

// Phase pages
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";

// Main feature pages
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";

// Settings pages
import ProfileSettings from "@/pages/settings/ProfileSettings";
import ExperienceSettings from "@/pages/settings/ExperienceSettings";
import LinksSettings from "@/pages/settings/LinksSettings";
import PrivacySettings from "@/pages/settings/PrivacySettings";

const queryClient = new QueryClient();

// Auth guard component to prevent authenticated users from accessing auth-specific pages only
const AuthGuard = ({ children, redirectAuth = false }: { children: React.ReactNode; redirectAuth?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // Only redirect authenticated users if this is an auth-specific page
  if (user && redirectAuth) {
    return <Navigate to="/app/dashboard" replace />;
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
              {/* Core authentication and onboarding */}
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<AppShell><Onboarding /></AppShell>} />
              
              {/* User profiles */}
              <Route path="/dna/me" element={<DnaMeRedirect />} />
              <Route path="/dna/:username" element={<UserDashboard />} />
              
              {/* Settings */}
              <Route path="/settings/profile" element={<AppShell><ProfileSettings /></AppShell>} />
              <Route path="/settings/experience" element={<AppShell><ExperienceSettings /></AppShell>} />
              <Route path="/settings/links" element={<AppShell><LinksSettings /></AppShell>} />
              <Route path="/settings/privacy" element={<AppShell><PrivacySettings /></AppShell>} />

              {/* Main app routes */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/*" element={<AppDashboard />} />
              
              {/* Phase pages */}
              <Route path="/phase-1/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase-2/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase-3/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase-4/mvp" element={<MvpPhase />} />
              <Route path="/phase-5/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase-6/go-to-market" element={<GoToMarketPhase />} />
              
              {/* Main feature pages */}
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              
              {/* Static pages */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Authentication flows */}
              <Route path="/invite" element={<InviteSignup />} />
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              <Route path="/onboarding/reset-password-complete" element={<ResetPasswordComplete />} />
              
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