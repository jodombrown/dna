
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { PageErrorBoundary, AppPageErrorBoundary, AdminPageErrorBoundary } from "./components/layout/PageErrorBoundary";
import "./services/errorLogger"; // Initialize error logging
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import AppDashboard from "./pages/AppDashboard";
import ProfilePage from "./pages/ProfilePage";
import ProfileSettings from "./pages/ProfileSettings";
import CommunityPage from "./pages/CommunityPage";
import MyCircles from "./pages/MyCircles";
import MyNetwork from "./pages/MyNetwork";
import MessagingPage from "./pages/MessagingPage";
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
import ProjectsExplorePage from "./pages/ProjectsExplorePage";
import InvitePage from "./pages/InvitePage";
import SearchPage from "./pages/SearchPage";
import NotificationsPage from "./pages/NotificationsPage";
import HelpPage from "./pages/HelpPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminInsightsDashboard from "./pages/AdminInsightsDashboard";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminRolesManager from "./pages/AdminRolesManager";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import AdminNotificationsPanel from "./pages/AdminNotificationsPanel";
import AdminGrowthDashboard from "./pages/AdminGrowthDashboard";
import AdminIntegrationsPanel from "./pages/AdminIntegrationsPanel";
import AdminCommunitiesPage from "./pages/AdminCommunitiesPage";
import AdminModerationPage from "./pages/AdminModerationPage";
import AdminEventsPage from "./pages/AdminEventsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProtectedRoute from "./components/app/ProtectedRoute";
import PublicRoute from "./components/app/PublicRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
            <RealtimeProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
            <Routes>
              {/* Public Routes - LEGACY/MARKETING ONLY - Redirect authenticated users to dashboard */}
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/contribute" element={<PublicRoute><ContributeExample /></PublicRoute>} />
              <Route path="/collaborate" element={<PublicRoute><CollaborationsExample /></PublicRoute>} />
              <Route path="/connect" element={<PublicRoute><ConnectExample /></PublicRoute>} />
              <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
              <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/invite" element={<InvitePage />} />
              
              {/* Phase Routes - LEGACY/MARKETING ONLY - Redirect authenticated users to dashboard */}
              <Route path="/phase/market-research" element={<PublicRoute><MarketResearchPhase /></PublicRoute>} />
              <Route path="/phase/prototyping" element={<PublicRoute><PrototypingPhase /></PublicRoute>} />
              <Route path="/phase/customer-discovery" element={<PublicRoute><CustomerDiscoveryPhase /></PublicRoute>} />
              <Route path="/phase/mvp" element={<PublicRoute><MvpPhase /></PublicRoute>} />
              <Route path="/phase/beta-validation" element={<PublicRoute><BetaValidationPhase /></PublicRoute>} />
              <Route path="/phase/go-to-market" element={<PublicRoute><GoToMarketPhase /></PublicRoute>} />
              
              {/* Authenticated Routes */}
              <Route path="/app" element={<ProtectedRoute><AppPageErrorBoundary><AppDashboard /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/explore/projects" element={<ProtectedRoute><AppPageErrorBoundary><ProjectsExplorePage /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><AppPageErrorBoundary><ProfilePage /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/profile/:username" element={<ProtectedRoute><AppPageErrorBoundary><ProfilePage /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/profile/settings" element={<ProtectedRoute><AppPageErrorBoundary><ProfileSettings /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><AppPageErrorBoundary><ProfileSettings /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/settings/profile" element={<ProtectedRoute><AppPageErrorBoundary><ProfileSettings /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><AppPageErrorBoundary><CommunityPage /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/community/:id" element={<ProtectedRoute><AppPageErrorBoundary><CommunityPage /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/circles" element={<ProtectedRoute><AppPageErrorBoundary><MyCircles /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/my-circles" element={<ProtectedRoute><AppPageErrorBoundary><MyCircles /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/my-network" element={<ProtectedRoute><AppPageErrorBoundary><MyNetwork /></AppPageErrorBoundary></ProtectedRoute>} />
              <Route path="/messaging" element={<ProtectedRoute><AppPageErrorBoundary><MessagingPage /></AppPageErrorBoundary></ProtectedRoute>} />
              
              {/* Search Route */}
              <Route path="/search" element={<ProtectedRoute><AppPageErrorBoundary><SearchPage /></AppPageErrorBoundary></ProtectedRoute>} />
              
              {/* Notifications Route */}
              <Route path="/notifications" element={<ProtectedRoute><AppPageErrorBoundary><NotificationsPage /></AppPageErrorBoundary></ProtectedRoute>} />
              
              {/* Leaderboard Route */}
              <Route path="/leaderboard" element={<ProtectedRoute><AppPageErrorBoundary><LeaderboardPage /></AppPageErrorBoundary></ProtectedRoute>} />
              
              {/* Admin Routes - Isolated System */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminPageErrorBoundary><AdminDashboardHome /></AdminPageErrorBoundary>} />
              <Route path="/admin/users" element={<AdminPageErrorBoundary><AdminUserManagement /></AdminPageErrorBoundary>} />
              <Route path="/admin/insights" element={<AdminPageErrorBoundary><AdminInsightsDashboard /></AdminPageErrorBoundary>} />
              <Route path="/admin/settings" element={<AdminPageErrorBoundary><AdminSettingsPage /></AdminPageErrorBoundary>} />
              <Route path="/admin/roles" element={<AdminPageErrorBoundary><AdminRolesManager /></AdminPageErrorBoundary>} />
              <Route path="/admin/growth" element={<AdminPageErrorBoundary><AdminGrowthDashboard /></AdminPageErrorBoundary>} />
              <Route path="/admin/integrations" element={<AdminPageErrorBoundary><AdminIntegrationsPanel /></AdminPageErrorBoundary>} />
              <Route path="/admin/logs" element={<AdminPageErrorBoundary><AdminAuditLogs /></AdminPageErrorBoundary>} />
              <Route path="/admin/notifications" element={<AdminPageErrorBoundary><AdminNotificationsPanel /></AdminPageErrorBoundary>} />
              <Route path="/admin/communities" element={<AdminPageErrorBoundary><AdminCommunitiesPage /></AdminPageErrorBoundary>} />
              <Route path="/admin/moderation" element={<AdminPageErrorBoundary><AdminModerationPage /></AdminPageErrorBoundary>} />
              <Route path="/admin/events" element={<AdminPageErrorBoundary><AdminEventsPage /></AdminPageErrorBoundary>} />
              <Route path="/admin" element={<AdminPageErrorBoundary><AdminDashboardHome /></AdminPageErrorBoundary>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
            </TooltipProvider>
            </RealtimeProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
