import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ViewStateProvider } from "@/contexts/ViewStateContext";
import { MessageProvider } from "@/contexts/MessageContext";
import { AccountDrawerProvider } from "@/contexts/AccountDrawerContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';
import BaseLayout from "@/layouts/BaseLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import React, { Suspense, lazy } from "react";

// Loading fallback for lazy-loaded routes
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Core pages - eagerly loaded for initial render
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { OnboardingGuard } from "./components/auth/OnboardingGuard";

// Lazy-loaded pages - split into separate chunks
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const InviteSignup = lazy(() => import("./pages/InviteSignup"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const DnaMe = lazy(() => import("./pages/dna/Me"));
const DnaUserDashboard = lazy(() => import("./pages/dna/Username"));
const PublicProfile = lazy(() => import("./pages/dna/PublicProfile"));
const ProfileV2 = lazy(() => import("./pages/ProfileV2"));
const ActivityFeed = lazy(() => import("./pages/ActivityFeed"));
const SavedPostsPage = lazy(() => import("./pages/SavedPostsPage"));
const DnaNetwork = lazy(() => import("./pages/dna/Network"));
const DnaFeed = lazy(() => import("./pages/dna/Feed"));
const HashtagFeed = lazy(() => import("./pages/dna/HashtagFeed"));
const DebugUniversalFeed = lazy(() => import("./pages/dna/DebugUniversalFeed"));
const DnaEvents = lazy(() => import("./pages/dna/Events"));
const DnaMessages = lazy(() => import("./pages/dna/MessagesInbox"));
const DnaImpact = lazy(() => import("./pages/dna/Impact"));
const DnaNotifications = lazy(() => import("./pages/dna/Notifications"));
const DnaAnalytics = lazy(() => import("./pages/dna/Analytics"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const EngagementDashboard = lazy(() => import("./pages/admin/EngagementDashboard"));
const AdminEngagement = lazy(() => import("./pages/admin/AdminEngagement"));
const AdminSignals = lazy(() => import("./pages/admin/AdminSignals"));
const WaitlistManagement = lazy(() => import("./pages/admin/WaitlistManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const PlatformHealth = lazy(() => import("./pages/admin/PlatformHealth"));
const ContentModeration = lazy(() => import("./pages/admin/ContentModeration"));
const FeedComingSoon = lazy(() => import("./pages/FeedComingSoon"));

// Static pages  
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const UserAgreement = lazy(() => import("./pages/UserAgreement"));

// Example pages
const ConnectExample = lazy(() => import("./pages/ConnectExample"));
const ConveneExample = lazy(() => import("./pages/ConveneExample"));
const CollaborationsExample = lazy(() => import("./pages/CollaborationsExample"));
const ContributeExample = lazy(() => import("./pages/ContributeExample"));
const ConveyExample = lazy(() => import("./pages/ConveyExample"));
const Convene = lazy(() => import("./pages/Convene"));
const ConveneCategoryPage = lazy(() => import("./pages/ConveneCategoryPage"));
const FeaturedCalendarsPage = lazy(() => import("./pages/FeaturedCalendarsPage"));
const LocalEventsPage = lazy(() => import("./pages/LocalEventsPage"));
const FactSheetPage = lazy(() => import("./pages/FactSheetPage"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const FeaturesHub = lazy(() => import("./pages/documentation/FeaturesHub"));
const FeatureDetail = lazy(() => import("./pages/documentation/FeatureDetail"));

// Convene M1-M3 pages
const ConveneHub = lazy(() => import("./pages/dna/convene/ConveneHub"));
const EventsIndex = lazy(() => import("./pages/dna/convene/EventsIndex"));
const EventDetail = lazy(() => import("./pages/dna/convene/EventDetail"));
const Welcome = lazy(() => import("./pages/dna/Welcome"));
const DashboardSettings = lazy(() => import("./pages/dna/DashboardSettings"));
const CreateEvent = lazy(() => import("./pages/dna/convene/CreateEvent"));
const MyEvents = lazy(() => import("./pages/dna/convene/MyEvents"));
const EventAnalytics = lazy(() => import("./pages/dna/convene/EventAnalytics"));
const OrganizerAnalytics = lazy(() => import("./pages/dna/convene/OrganizerAnalytics"));
const GroupsBrowse = lazy(() => import("./pages/dna/convene/GroupsBrowse"));
const GroupEventsPage = lazy(() => import("./pages/dna/convene/GroupEventsPage"));

// Collaborate M1-M5 pages
const CollaborateHub = lazy(() => import("./pages/dna/collaborate/CollaborateHub"));
const SpacesIndex = lazy(() => import("./pages/dna/collaborate/SpacesIndex"));
const CollaborateSpaceDetail = lazy(() => import("./pages/dna/collaborate/SpaceDetail"));
const SpaceBoard = lazy(() => import("./pages/dna/collaborate/SpaceBoard"));
const CreateSpace = lazy(() => import("./pages/dna/collaborate/CreateSpace"));
const SpaceSettings = lazy(() => import("./pages/dna/collaborate/SpaceSettings"));
const MySpaces = lazy(() => import("./pages/dna/collaborate/MySpaces"));

// Contribute M1-M2 pages
const ContributeHub = lazy(() => import("./pages/dna/contribute/ContributeHub"));
const NeedsIndex = lazy(() => import("./pages/dna/contribute/NeedsIndex"));
const NeedDetail = lazy(() => import("./pages/dna/contribute/NeedDetail"));
const OpportunityDetail = lazy(() => import("./pages/dna/contribute/OpportunityDetail"));
const MyContributions = lazy(() => import("./pages/dna/contribute/MyContributions"));

// Convey M1-M4 pages
const Convey = lazy(() => import("./pages/dna/Convey"));
const ConveyHub = lazy(() => import("./pages/dna/convey/ConveyHub"));
const StoryDetail = lazy(() => import("./pages/dna/convey/StoryDetail"));
const FeedStoryDetail = lazy(() => import("./pages/dna/FeedStoryDetail"));
const CreateStory = lazy(() => import("./pages/dna/convey/CreateStory"));
const ConveyAnalytics = lazy(() => import("./pages/dna/admin/ConveyAnalytics"));

// Feature pages
const Opportunities = lazy(() => import("./pages/Opportunities"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const CollaborationSpaces = lazy(() => import("./pages/CollaborationSpaces"));
const SpaceDetail = lazy(() => import("./pages/SpaceDetail"));
const Discover = lazy(() => import("./pages/Discover"));
const DiscoverMembers = lazy(() => import("./pages/DiscoverMembers"));
const DnaDiscover = lazy(() => import("./pages/dna/Discover"));
const Network = lazy(() => import("./pages/Network"));
const Messages = lazy(() => import("./pages/Messages"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));

// Settings Hub pages
const AccountSettings = lazy(() => import("./pages/dna/settings/AccountSettings"));
const PrivacySettings = lazy(() => import("./pages/dna/settings/PrivacySettings"));
const NotificationSettings = lazy(() => import("./pages/dna/settings/NotificationSettings"));
const PreferencesSettings = lazy(() => import("./pages/dna/settings/PreferencesSettings"));
const AdinPreferences = lazy(() => import("./pages/AdinPreferences"));
const NudgeCenter = lazy(() => import("./pages/NudgeCenter"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const DnaGroups = lazy(() => import("./pages/dna/Groups"));
const GroupDetailsPage = lazy(() => import("./pages/GroupDetailsPage"));
const GroupSettingsPage = lazy(() => import("./pages/GroupSettingsPage"));

// CONNECT M2 - New Connect Hub pages
const Connect = lazy(() => import("./pages/dna/connect/Connect"));
const ConnectLayout = lazy(() => import("./components/connect/ConnectLayout").then(m => ({ default: m.ConnectLayout })));
const ConnectDiscover = lazy(() => import("./pages/dna/connect/Discover"));
const ConnectNetwork = lazy(() => import("./pages/dna/connect/Network"));
const ConnectMessages = lazy(() => import("./pages/dna/connect/Messages"));
const ConversationView = lazy(() => import("./pages/dna/connect/ConversationView"));

// Regional pages
const NorthAfricaLandingPage = lazy(() => import("./pages/NorthAfricaLandingPage"));

// Phase pages
const MarketResearchPhase = lazy(() => import("./pages/MarketResearchPhase"));
const PrototypingPhase = lazy(() => import("./pages/PrototypingPhase"));
const CustomerDiscoveryPhase = lazy(() => import("./pages/CustomerDiscoveryPhase"));
const MvpPhase = lazy(() => import("./pages/MvpPhase"));
const BetaValidationPhase = lazy(() => import("./pages/BetaValidationPhase"));
const GoToMarketPhase = lazy(() => import("./pages/GoToMarketPhase"));
const Moderation = lazy(() => import("./pages/admin/Moderation"));

// Partner With DNA pages
const PartnerWithDna = lazy(() => import("./pages/PartnerWithDna"));
const PartnerSector = lazy(() => import("./pages/PartnerSector"));
const PartnerModels = lazy(() => import("./pages/PartnerModels"));
const PartnerStart = lazy(() => import("./pages/PartnerStart"));


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
            <ScrollToTop />
            <AuthProvider>
              <AccountDrawerProvider>
                <ViewStateProvider>
                  <MessageProvider>
                    <BaseLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
              {/* Core authentication */}
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              
              {/* Onboarding & Welcome - NOT wrapped with OnboardingGuard */}
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dna/welcome" element={<Welcome />} />
              
              {/* Settings Hub - multiple paths for different sections */}
              <Route path="/dna/settings" element={
                <OnboardingGuard>
                  <Navigate to="/dna/settings/account" replace />
                </OnboardingGuard>
              } />
              <Route path="/dna/settings/account" element={
                <OnboardingGuard>
                  <AccountSettings />
                </OnboardingGuard>
              } />
              <Route path="/dna/settings/privacy" element={
                <OnboardingGuard>
                  <PrivacySettings />
                </OnboardingGuard>
              } />
              <Route path="/dna/settings/notifications" element={
                <OnboardingGuard>
                  <NotificationSettings />
                </OnboardingGuard>
              } />
              <Route path="/dna/settings/preferences" element={
                <OnboardingGuard>
                  <PreferencesSettings />
                </OnboardingGuard>
              } />
              {/* Legacy settings routes - redirect to new hub */}
              <Route path="/dna/settings/dashboard" element={<Navigate to="/dna/settings/preferences" replace />} />
              <Route path="/dna/settings/profile" element={<Navigate to="/dna/profile/edit" replace />} />
              
              {/* DNA Dashboard Routes - Protected with OnboardingGuard */}
              <Route path="/fact-sheet" element={<FactSheetPage />} />
              <Route path="/pitch-deck" element={<PitchDeck />} />
              
              {/* Documentation Routes */}
              <Route path="/documentation/features" element={<FeaturesHub />} />
              <Route path="/documentation/features/:slug" element={<FeatureDetail />} />
              
              {/* Redirect old /dna/me to user's profile */}
              <Route path="/dna/me" element={<Navigate to="/dna/feed" replace />} />
              <Route path="/dna/:username" element={
                <OnboardingGuard>
                  <ProfileV2 />
                </OnboardingGuard>
              } />
              <Route path="/dna/profile/edit" element={
                <OnboardingGuard>
                  <ProfileEdit />
                </OnboardingGuard>
              } />

              {/* ========== CONNECT HUB M2 ========== */}
              <Route path="/dna/connect" element={
                <OnboardingGuard>
                  <ConnectLayout />
                </OnboardingGuard>
              }>
                <Route index element={<Navigate to="/dna/connect/discover" replace />} />
                <Route path="discover" element={<ConnectDiscover />} />
                <Route path="network" element={<ConnectNetwork />} />
                {/* Legacy route - now using /dna/messages as canonical */}
                <Route path="messages" element={<Navigate to="/dna/messages" replace />} />
                <Route path="messages/:conversationId" element={<Navigate to="/dna/messages" replace />} />
              </Route>
              
              {/* ========== LEGACY CONNECT & DISCOVER ROUTES - Redirects ========== */}
              <Route path="/dna/discover/members" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/discover" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/discover/feed" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/dna/network" element={<Navigate to="/dna/connect/network" replace />} />
              <Route path="/dna/network/feed" element={<Navigate to="/dna/connect/discover" replace />} />
               {/* Feed is the multi-C activity stream home */}
               <Route path="/dna/feed" element={
                 <OnboardingGuard>
                   <DnaFeed />
                 </OnboardingGuard>
               } />
               {/* Debug feed page */}
               <Route path="/dna/debug/feed" element={
                 <OnboardingGuard>
                   <DebugUniversalFeed />
                 </OnboardingGuard>
               } />
               {/* Hashtag feed page */}
               <Route path="/dna/hashtag/:hashtag" element={
                 <OnboardingGuard>
                   <HashtagFeed />
                 </OnboardingGuard>
               } />
               {/* Messages: Canonical routes */}
              <Route path="/dna/messages" element={
                <OnboardingGuard>
                  <DnaMessages />
                </OnboardingGuard>
              } />
              <Route path="/dna/messages/:conversationId" element={
                <OnboardingGuard>
                  <DnaMessages />
                </OnboardingGuard>
              } />
              
              {/* Legacy message routes - redirect to canonical */}
              <Route path="/dna/connect/messages" element={<Navigate to="/dna/messages" replace />} />
              <Route path="/dna/connect/messages/:conversationId" element={<Navigate to="/dna/messages" replace />} />
              <Route path="/discover/members" element={<Navigate to="/dna/connect/discover" replace />} />
              <Route path="/discover" element={<Navigate to="/dna/connect/discover" replace />} />
              
              {/* ========== CONVENE PILLAR M1 ========== */}
              <Route path="/dna/convene" element={
                <OnboardingGuard>
                  <ConveneHub />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/events" element={
                <OnboardingGuard>
                  <EventsIndex />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/events/:id" element={
                <OnboardingGuard>
                  <EventDetail />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/events/new" element={
                <OnboardingGuard>
                  <CreateEvent />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/events/:id/edit" element={<EditEventPage />} />
              <Route path="/dna/convene/events/:id/analytics" element={
                <OnboardingGuard>
                  <EventAnalytics />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/my-events" element={
                <OnboardingGuard>
                  <MyEvents />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/analytics" element={
                <OnboardingGuard>
                  <OrganizerAnalytics />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/groups" element={
                <OnboardingGuard>
                  <DnaGroups />
                </OnboardingGuard>
              } />
              <Route path="/dna/convene/groups/:slug/events" element={<OnboardingGuard><GroupEventsPage /></OnboardingGuard>} />
              <Route path="/dna/convene/groups/:slug" element={<GroupDetailsPage />} />
              <Route path="/dna/convene/groups/:slug/settings" element={<GroupSettingsPage />} />
              
              {/* ========== COLLABORATE PILLAR M1-M5 ========== */}
              <Route path="/dna/collaborate" element={
                <OnboardingGuard>
                  <CollaborateHub />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/spaces" element={
                <OnboardingGuard>
                  <SpacesIndex />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/spaces/new" element={
                <OnboardingGuard>
                  <CreateSpace />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/spaces/:slug" element={
                <OnboardingGuard>
                  <CollaborateSpaceDetail />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/spaces/:slug/board" element={
                <OnboardingGuard>
                  <SpaceBoard />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/spaces/:slug/settings" element={
                <OnboardingGuard>
                  <SpaceSettings />
                </OnboardingGuard>
              } />
              <Route path="/dna/collaborate/my-spaces" element={
                <OnboardingGuard>
                  <MySpaces />
                </OnboardingGuard>
              } />
              
              {/* ========== CONTRIBUTE PILLAR M1 ========== */}
              <Route path="/dna/contribute" element={
                <OnboardingGuard>
                  <ContributeHub />
                </OnboardingGuard>
              } />
              <Route path="/dna/contribute/needs" element={
                <OnboardingGuard>
                  <NeedsIndex />
                </OnboardingGuard>
              } />
              <Route path="/dna/contribute/needs/:id" element={
                <OnboardingGuard>
                  <OpportunityDetail />
                </OnboardingGuard>
              } />
              <Route path="/dna/contribute/my" element={
                <OnboardingGuard>
                  <MyContributions />
                </OnboardingGuard>
              } />
              
              {/* CONVEY M1-M4 - Story Feed, Details, Authoring & Analytics */}
              <Route path="/dna/convey" element={
                <OnboardingGuard>
                  <Convey />
                </OnboardingGuard>
              } />
              <Route path="/dna/convey/new" element={
                <OnboardingGuard>
                  <CreateStory />
                </OnboardingGuard>
              } />
              {/* Feed Stories - unified post_id based detail view */}
              <Route path="/dna/story/:id" element={
                <OnboardingGuard>
                  <FeedStoryDetail />
                </OnboardingGuard>
              } />
              {/* Convey Items - legacy slug-based detail view */}
              <Route path="/dna/convey/stories/:slug" element={
                <OnboardingGuard>
                  <StoryDetail />
                </OnboardingGuard>
              } />
              
              {/* Legacy convene route redirects */}
              <Route path="/dna/events" element={<Navigate to="/dna/convene/events" replace />} />
              <Route path="/events" element={<Navigate to="/dna/convene/events" replace />} />
              <Route path="/dna/convene-example" element={<Navigate to="/dna/convene" replace />} />
              
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
               {/* Legacy space route - redirect to canonical collaborate route */}
               <Route path="/dna/space/:slug" element={<Navigate to="/dna/collaborate/spaces/:slug" replace />} />
              
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
                <Route path="convey" element={<ConveyAnalytics />} />
              </Route>
              <Route path="/app/admin/moderation" element={<Moderation />} />

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
              
              {/* Partner With DNA pages */}
              <Route path="/partner-with-dna" element={<PartnerWithDna />} />
              <Route path="/partner-with-dna/sectors/:slug" element={<PartnerSector />} />
              <Route path="/partner-with-dna/models" element={<PartnerModels />} />
              <Route path="/partner-with-dna/start" element={<PartnerStart />} />
              
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
                  </Suspense>
                <BadgeToastListener />
              </BaseLayout>
                </MessageProvider>
              </ViewStateProvider>
              </AccountDrawerProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;