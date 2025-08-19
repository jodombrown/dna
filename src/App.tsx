
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
import AdminLogin from "./pages/AdminLogin";

import UserDashboard from "./pages/UserDashboard";
import HomePage from "./pages/HomePage";

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
import MyEvents from "@/pages/app/MyEvents";
import Projects from "@/pages/app/Projects";
import ProjectCreate from "@/pages/app/ProjectCreate";
import ProjectDetail from "@/pages/app/ProjectDetail";
import ProjectManage from "@/pages/app/ProjectManage";
import ProjectEdit from "@/pages/app/ProjectEdit";
import OpportunityNew from "@/pages/app/OpportunityNew";
import Notifications from "@/pages/app/Notifications";
import EventPaymentSuccess from "@/pages/app/EventPaymentSuccess";
import EventCheckIn from "@/pages/app/EventCheckIn";
import ConnectionDetailPage from "@/pages/app/ConnectionDetailPage";
import UnifiedSettings from "@/pages/settings/UnifiedSettings";

const queryClient = new QueryClient();

// Auth guard component to prevent authenticated users from accessing auth-specific pages only
const AuthGuard = ({ children, redirectAuth = false }: { children: React.ReactNode; redirectAuth?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
    // Only redirect authenticated users if this is an auth-specific page
    if (user && redirectAuth) {
      return <Navigate to="/dna" replace />;
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
              <Route path="/admin-login" element={<AuthGuard redirectAuth><AdminLogin /></AuthGuard>} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/onboarding" element={<AppShell><Onboarding /></AppShell>} />
              <Route path="/onboarding/*" element={<Navigate to="/onboarding" replace />} />
              <Route path="/welcome/*" element={<Navigate to="/dna" replace />} />
              <Route path="/complete-profile/*" element={<Navigate to="/dna" replace />} />
              <Route path="/post-onboarding" element={<Navigate to="/dna" replace />} />
              {/* New Home Page */}
              <Route path="/home" element={<AppShell><HomePage /></AppShell>} />
              
              {/* Universal DNA Platform - All features under /dna */}
              <Route path="/dna" element={<AppShell><AppDashboard /></AppShell>} />
              <Route path="/dna/*" element={<AppShell><AppDashboard /></AppShell>} />
              <Route path="/dna/me" element={<DnaMeRedirect />} />
              <Route path="/dna/:username" element={<UserDashboard />} />
              
              {/* Legacy /app redirects */}
              <Route path="/app" element={<Navigate to="/dna" replace />} />
              <Route path="/app/*" element={<Navigate to="/dna" replace />} />
         <Route path="/events/new" element={<EventNewWizard />} />
        <Route path="/events/category/:slug" element={<EventCategoryPage />} />
        <Route path="/events/:slug" element={<EventsBySlug />} />
        <Route path="/events/:id/payment-success" element={<EventPaymentSuccess />} />
        <Route path="/join/:token" element={<EventJoin />} />
              
              {/* Unified Settings */}
              <Route path="/settings" element={<AppShell><UnifiedSettings /></AppShell>} />
              <Route path="/settings/profile" element={<AppShell><UnifiedSettings /></AppShell>} />
              <Route path="/settings/experience" element={<AppShell><UnifiedSettings /></AppShell>} />
              <Route path="/settings/dna-experience" element={<AppShell><UnifiedSettings /></AppShell>} />
              <Route path="/settings/links" element={<AppShell><UnifiedSettings /></AppShell>} />
              <Route path="/settings/privacy" element={<AppShell><UnifiedSettings /></AppShell>} />
              
              {/* Static Pages */}
              <Route path="/contribute" element={<AppShell><ContributeExample /></AppShell>} />
              <Route path="/collaborate" element={<AppShell><CollaborationsExample /></AppShell>} />
              <Route path="/connect" element={<AppShell><ConnectExample /></AppShell>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />

              {/* Me route */}
              <Route path="/me" element={<Navigate to="/dna/me" replace />} />
              
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
