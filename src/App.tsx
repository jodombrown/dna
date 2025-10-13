import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ViewStateProvider } from "@/contexts/ViewStateContext";
import { MessageProvider } from "@/contexts/MessageContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';
import BaseLayout from "@/layouts/BaseLayout";
import ErrorBoundary from "@/components/ErrorBoundary";

// Core pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import InviteSignup from "./pages/InviteSignup";
import Onboarding from "./pages/Onboarding";
import DnaMe from "./pages/dna/Me";
import DnaUserDashboard from "./pages/dna/Username";
import ActivityFeed from "./pages/ActivityFeed";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEngagement from "./pages/admin/AdminEngagement";
import AdminSignals from "./pages/admin/AdminSignals";
import { OnboardingGuard } from "./components/auth/OnboardingGuard";
import FeedComingSoon from "./pages/FeedComingSoon";

// Static pages  
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Example pages
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";

// Feature pages
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import MyApplications from "./pages/MyApplications";
import CollaborationSpaces from "./pages/CollaborationSpaces";
import SpaceDetail from "./pages/SpaceDetail";
import Discover from "./pages/Discover";
import Network from "./pages/Network";
import Messages from "./pages/Messages";
import ProfileEdit from "./pages/ProfileEdit";
import EventsPage from "./pages/EventsPage";
// Phase 1.5: Event detail pages (currently using TwoColumnLayout in EventsPage)
// import EventDetailPage from "./pages/EventDetailPage";
// import EventManagementPage from "./pages/EventManagementPage";
// import EventEditPage from "./pages/EventEditPage";

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
    return <Navigate to="/dna/me" replace />;
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ViewStateProvider>
                <MessageProvider>
                  <BaseLayout>
                  <Routes>
              {/* Core authentication */}
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              
              {/* Onboarding - NOT wrapped with OnboardingGuard */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* DNA Dashboard Routes - Protected with OnboardingGuard */}
              <Route path="/dna/me" element={
                <OnboardingGuard>
                  <DnaMe />
                </OnboardingGuard>
              } />
              <Route path="/dna/:username" element={
                <OnboardingGuard>
                  <DnaUserDashboard />
                </OnboardingGuard>
              } />
              
              {/* Activity Feed */}
              <Route path="/dna/feed" element={
                <OnboardingGuard>
                  <ActivityFeed />
                </OnboardingGuard>
              } />
              
              {/* Main feature pages under /dna namespace */}
              <Route path="/dna/connect" element={<ConnectExample />} />
              <Route path="/dna/feed" element={<FeedComingSoon />} />
              <Route path="/dna/events" element={<EventsPage />} />
              {/* Phase 1.5: Event detail routes deferred - EventsPage uses TwoColumnLayout for detail view */}
              {/* <Route path="/dna/events/:id" element={<EventDetailPage />} /> */}
              {/* <Route path="/dna/events/manage" element={<EventManagementPage />} /> */}
              {/* <Route path="/dna/events/manage/:id" element={<EventEditPage />} /> */}
              <Route path="/events" element={<EventsPage />} />
              <Route path="/dna/impact" element={<Opportunities />} />
              <Route path="/dna/impact/:id" element={<OpportunityDetail />} />
              <Route path="/dna/applications" element={<MyApplications />} />
              <Route path="/dna/spaces" element={<CollaborationSpaces />} />
              <Route path="/dna/spaces/:id" element={<SpaceDetail />} />
              <Route path="/dna/discover" element={<Discover />} />
              <Route path="/dna/network" element={<Network />} />
              <Route path="/dna/messages" element={<Messages />} />
              <Route path="/app/profile/edit" element={
                <OnboardingGuard>
                  <ProfileEdit />
                </OnboardingGuard>
              } />
              
              {/* Legacy example pages - keep for landing page */}
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              
              {/* Admin routes */}
              <Route path="/app/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="engagement" element={<AdminEngagement />} />
                <Route path="signals" element={<AdminSignals />} />
              </Route>
              
              {/* Regional landing pages */}
              <Route path="/north-africa" element={<NorthAfricaLandingPage />} />
              
              {/* Static pages */}
              
              {/* Phase pages */}
              <Route path="/phase-1/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase-2/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase-3/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase-4/mvp" element={<MvpPhase />} />
              <Route path="/phase-5/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase-6/go-to-market" element={<GoToMarketPhase />} />
              
              {/* Static pages */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Authentication flows */}
              <Route path="/invite" element={<InviteSignup />} />
              
              <Route path="*" element={<NotFound />} />
                </Routes>
                <BadgeToastListener />
              </BaseLayout>
                </MessageProvider>
              </ViewStateProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;