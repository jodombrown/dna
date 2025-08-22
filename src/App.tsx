
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/AppDashboard";
import ContributeExample from "./pages/ContributeExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ConnectExample from "./pages/ConnectExample";
import Contact from "./pages/Contact";
import About from "./pages/About";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import NotFound from "./pages/NotFound";
import InviteSignup from "./pages/InviteSignup";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordComplete from "./pages/ResetPasswordComplete";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import { PostOnboardingFlow } from "./pages/PostOnboardingFlow";
import AdminDiagnostics from "./pages/app/AdminDiagnostics";
import AuthCallback from "./pages/AuthCallback";

import UserDashboard from "./pages/UserDashboard";

// Safety stub: guard against any stale references to removed dev route
const DnaDev = () => null;

import DnaMeRedirect from "./pages/DnaMeRedirect";
import Events from "@/pages/app/Events";
import EventNew from "@/pages/app/EventNew";
import EventDetail from "@/pages/app/EventDetail";
import EventEdit from "@/pages/app/EventEdit";
import EventManage from "@/pages/app/EventManage";
import EventNewWizard from "@/pages/app/EventNewWizard";
import EventsBySlug from "@/pages/app/EventsBySlug";
import EventCategoryPage from "@/pages/app/EventCategoryPage";
import EventJoin from "@/pages/app/EventJoin";
import OpportunityNew from "@/pages/app/OpportunityNew";
import Notifications from "@/pages/app/Notifications";
import EventPaymentSuccess from "@/pages/app/EventPaymentSuccess";
import EventCheckIn from "@/pages/app/EventCheckIn";
import ProfileSettings from "@/pages/settings/ProfileSettings";
import ExperienceSettings from "@/pages/settings/ExperienceSettings";
import LinksSettings from "@/pages/settings/LinksSettings";
import PrivacySettings from "@/pages/settings/PrivacySettings";
import ConnectionDetailPage from "@/pages/app/ConnectionDetailPage";

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

// Onboarding gate disabled


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
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<AppShell><Onboarding /></AppShell>} />
              <Route path="/onboarding/*" element={<Navigate to="/onboarding" replace />} />
              <Route path="/welcome/*" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/complete-profile/*" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/post-onboarding" element={<Navigate to="/app/dashboard" replace />} />
              {/* Dynamic User Dashboard Route */}
              <Route path="/dna/me" element={<DnaMeRedirect />} />
              <Route path="/dna/:username" element={<UserDashboard />} />
              
              {/* Dashboard V1 Archive Route - MUST come before /app/* */}
              <Route path="/app/v1/*" element={<Navigate to="/app/dashboard" replace />} />
              
        <Route path="/app/events" element={<AppShell><Events /></AppShell>} />
        <Route path="/app/events/new" element={<AppShell><Navigate to="/events/new" replace /></AppShell>} />
        <Route path="/app/events/:id" element={<AppShell><EventDetail /></AppShell>} />
        <Route path="/app/events/:id/edit" element={<AppShell><EventEdit /></AppShell>} />
        <Route path="/app/events/:id/manage" element={<AppShell><EventManage /></AppShell>} />
        <Route path="/app/events/:id/checkin" element={<AppShell><EventCheckIn /></AppShell>} />
        <Route path="/events/new" element={<EventNewWizard />} />
        <Route path="/events/category/:slug" element={<EventCategoryPage />} />
        <Route path="/events/:slug" element={<EventsBySlug />} />
        <Route path="/events/:id/payment-success" element={<EventPaymentSuccess />} />
        <Route path="/join/:token" element={<EventJoin />} />
              <Route path="/app/opportunities/new" element={<AppShell><OpportunityNew /></AppShell>} />
              <Route path="/app/notifications" element={<AppShell><Notifications /></AppShell>} />
              <Route path="/app/connections/:id" element={<AppShell><ConnectionDetailPage /></AppShell>} />
              
              {/* Settings */}
              <Route path="/settings/profile" element={<AppShell><ProfileSettings /></AppShell>} />
              <Route path="/settings/experience" element={<AppShell><ExperienceSettings /></AppShell>} />
              <Route path="/settings/links" element={<AppShell><LinksSettings /></AppShell>} />
              <Route path="/settings/privacy" element={<AppShell><PrivacySettings /></AppShell>} />

              {/* Me route */}
              <Route path="/me" element={<Navigate to="/app/profile" replace />} />

              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/*" element={<AppShell><AppDashboard /></AppShell>} />
              <Route path="/contribute" element={<AppShell><ContributeExample /></AppShell>} />
              <Route path="/collaborate" element={<AppShell><CollaborationsExample /></AppShell>} />
              <Route path="/connect" element={<AppShell><ConnectExample /></AppShell>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Invite Signup Route */}
              <Route path="/invite" element={<InviteSignup />} />
              
              {/* Password Reset Routes */}
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              <Route path="/onboarding/reset-password-complete" element={<ResetPasswordComplete />} />
              
              <Route path="/phase-1/market-research" element={<AuthGuard><MarketResearchPhase /></AuthGuard>} />
              <Route path="/phase-2/prototyping" element={<AuthGuard><PrototypingPhase /></AuthGuard>} />
              <Route path="/phase-3/customer-discovery" element={<AuthGuard><CustomerDiscoveryPhase /></AuthGuard>} />
              <Route path="/phase-4/mvp" element={<AuthGuard><MvpPhase /></AuthGuard>} />
              <Route path="/phase-5/beta-validation" element={<AuthGuard><BetaValidationPhase /></AuthGuard>} />
              <Route path="/phase-6/go-to-market" element={<AuthGuard><GoToMarketPhase /></AuthGuard>} />

              {/* Redirects from old /phase/* to new canonical /phase-#/* */}
              <Route path="/phase/market-research" element={<Navigate to="/phase-1/market-research" replace />} />
              <Route path="/phase/prototyping" element={<Navigate to="/phase-2/prototyping" replace />} />
              <Route path="/phase/customer-discovery" element={<Navigate to="/phase-3/customer-discovery" replace />} />
              <Route path="/phase/mvp" element={<Navigate to="/phase-4/mvp" replace />} />
              <Route path="/phase/beta-validation" element={<Navigate to="/phase-5/beta-validation" replace />} />
              <Route path="/phase/go-to-market" element={<Navigate to="/phase-6/go-to-market" replace />} />


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
