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
import SavedPostsPage from "./pages/SavedPostsPage";
import NetworkFeedPage from "./pages/NetworkFeedPage";
import DiscoveryFeedPage from "./pages/DiscoveryFeedPage";
import DnaNetwork from "./pages/dna/Network";
import DnaFeed from "./pages/dna/Feed";
import DnaEvents from "./pages/dna/Events";
import DnaMessages from "./pages/dna/Messages";
import DnaImpact from "./pages/dna/Impact";
import DnaNotifications from "./pages/dna/Notifications";
import DnaAnalytics from "./pages/dna/Analytics";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EngagementDashboard from "./pages/admin/EngagementDashboard";
import AdminEngagement from "./pages/admin/AdminEngagement";
import AdminSignals from "./pages/admin/AdminSignals";
import WaitlistManagement from "./pages/admin/WaitlistManagement";
import UserManagement from "./pages/admin/UserManagement";
import PlatformHealth from "./pages/admin/PlatformHealth";
import ContentModeration from "./pages/admin/ContentModeration";
import { OnboardingGuard } from "./components/auth/OnboardingGuard";
import FeedComingSoon from "./pages/FeedComingSoon";

// Static pages  
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import UserAgreement from "./pages/UserAgreement";

// Example pages
import ConnectExample from "./pages/ConnectExample";
import ConveneExample from "./pages/ConveneExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import ConveyExample from "./pages/ConveyExample";
import Convene from "./pages/Convene";
import ConveneCategoryPage from "./pages/ConveneCategoryPage";
import FeaturedCalendarsPage from "./pages/FeaturedCalendarsPage";
import LocalEventsPage from "./pages/LocalEventsPage";
import FactSheetPage from "./pages/FactSheetPage";
import PitchDeck from "./pages/PitchDeck";

// Feature pages
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import MyApplications from "./pages/MyApplications";
import CollaborationSpaces from "./pages/CollaborationSpaces";
import SpaceDetail from "./pages/SpaceDetail";
import Discover from "./pages/Discover";
import DiscoverMembers from "./pages/DiscoverMembers";
import DnaDiscover from "./pages/dna/Discover";
import Network from "./pages/Network";
import Messages from "./pages/Messages";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotificationSettingsPage from "./pages/NotificationSettingsPage";
import ProfileEdit from "./pages/ProfileEdit";
import AdinPreferences from "./pages/AdinPreferences";
import NudgeCenter from "./pages/NudgeCenter";
import EventsPage from "./pages/EventsPage";
import EventDetailsPage from "./pages/EventDetailsPage";
import EditEventPage from "./pages/EditEventPage";
import GroupsPage from "./pages/GroupsPage";
import DnaGroups from "./pages/dna/Groups";
import GroupDetailsPage from "./pages/GroupDetailsPage";
import GroupSettingsPage from "./pages/GroupSettingsPage";

// CONNECT M2 - New Connect Hub pages
import Connect from "./pages/dna/connect/Connect";
import ConnectDiscover from "./pages/dna/connect/Discover";
import ConnectNetwork from "./pages/dna/connect/Network";
import ConnectMessages from "./pages/dna/connect/Messages";

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
  
  // Redirect authenticated users away from auth-only pages (login/signup)
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
              <Route path="/fact-sheet" element={<FactSheetPage />} />
              <Route path="/pitch-deck" element={<PitchDeck />} />
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
              
              {/* ========== CONNECT HUB M2 ========== */}
              <Route path="/dna/connect" element={
                <OnboardingGuard>
                  <Connect />
                </OnboardingGuard>
              }>
                <Route index element={<Navigate to="/dna/connect/discover" replace />} />
                <Route path="discover" element={<ConnectDiscover />} />
                <Route path="network" element={<ConnectNetwork />} />
                <Route path="messages" element={<ConnectMessages />} />
                <Route path="messages/:conversationId" element={<ConnectMessages />} />
              </Route>
              
              {/* ========== LEGACY CONNECT & DISCOVER ROUTES - Redirects ========== */}
              <Route path="/dna/discover/members" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/discover" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/discover/feed" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/network" element={<Navigate to="/dna/connect/network" replace />} />
              <Route path="/dna/network/feed" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/feed" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/messages" element={<Navigate to="/dna/connect/messages" replace />} />
              <Route path="/dna/messages/:conversationId" element={<Navigate to="/dna/connect/messages" replace />} />
              <Route path="/discover/members" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/discover" element={<Navigate to="/dna/connect/discover" replace />} />
              
              {/* ========== CONVENE PILLAR ========== */}
              <Route path="/dna/convene/events" element={
                <OnboardingGuard>
                  <DnaEvents />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/events/:id" element={<EventDetailsPage />} />
              <Route path="/dna/convene/events/:id/edit" element={<EditEventPage />} />
              <Route path="/dna/convene/groups" element={
                <OnboardingGuard>
                  <DnaGroups />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/groups/:slug" element={<GroupDetailsPage />} />
              <Route path="/dna/convene/groups/:slug/settings" element={<GroupSettingsPage />} />
              {/* Legacy convene route redirects */}
              <Route path="/dna/events" element={<Navigate to="/dna/convene/events" replace />} />
              <Route path="/events" element={<Navigate to="/dna/convene/events" replace />} />
              
              {/* ========== CONTRIBUTE PILLAR (Future) ========== */}
              <Route path="/dna/impact" element={
                <OnboardingGuard>
                  <DnaImpact />
                </OnboardingGuard>
              } />
              <Route path="/dna/impact/:id" element={<OpportunityDetail />} />
               <Route path="/dna/applications" element={<MyApplications />} />
               <Route path="/dna/spaces" element={<CollaborationSpaces />} />
               <Route path="/dna/spaces/:id" element={<SpaceDetail />} />
               <Route path="/dna/saved" element={
                 <OnboardingGuard>
                   <SavedPostsPage />
                 </OnboardingGuard>
               } />
               
               {/* ========== LEGACY ROUTES ========== */}
              <Route path="/dna/connect" element={<Navigate to="/dna/connect/network" replace />} />
              <Route path="/dna/convene" element={<Navigate to="/dna/convene/events" replace />} />
              
              {/* ========== NOTIFICATIONS & NUDGES ========== */}
              <Route path="/dna/notifications" element={
                <OnboardingGuard>
                  <DnaNotifications />
                </OnboardingGuard>
              } />
              <Route path="/dna/nudges" element={
                <OnboardingGuard>
                  <NudgeCenter />
                </OnboardingGuard>
              } />
              <Route path="/dna/preferences" element={
                <OnboardingGuard>
                  <AdinPreferences />
                </OnboardingGuard>
              } />
              {/* ========== ANALYTICS ========== */}
              <Route path="/dna/analytics" element={
                <OnboardingGuard>
                  <DnaAnalytics />
                </OnboardingGuard>
              } />
              
              <Route path="/app/profile/edit" element={
                <OnboardingGuard>
                  <ProfileEdit />
                </OnboardingGuard>
              } />
              
              {/* Legacy example pages - keep for landing page */}
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/convene" element={<Convene />} />
              <Route path="/convene/category/:category" element={<ConveneCategoryPage />} />
              <Route path="/convene/featured-calendars" element={<FeaturedCalendarsPage />} />
              <Route path="/convene/local-events" element={<LocalEventsPage />} />
              <Route path="/convene-example" element={<ConveneExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              <Route path="/convey" element={<ConveyExample />} />
              
              {/* Admin routes */}
              <Route path="/app/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="waitlist" element={<WaitlistManagement />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="health" element={<PlatformHealth />} />
                <Route path="engagement" element={<EngagementDashboard />} />
                <Route path="signals" element={<AdminSignals />} />
                <Route path="moderation" element={<ContentModeration />} />
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
              <Route path="/legal/user-agreement" element={<UserAgreement />} />
              <Route path="/legal/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              
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