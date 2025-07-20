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
import Phases from "./pages/Phases";
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
import AdminPostManagement from "./pages/AdminPostManagement";
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

const queryClient = new QueryClient();

function App() {
  try {
    console.log('App starting...');
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
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="/contribute" element={<ContributeExample />} />
                      <Route path="/collaborate" element={<CollaborationsExample />} />
                      <Route path="/connect" element={<ConnectExample />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/phases" element={<Phases />} />
                      <Route path="/help" element={<HelpPage />} />
                      <Route path="/invite" element={<InvitePage />} />
                      
                      {/* Phase Routes */}
                      <Route path="/phase/market-research" element={<MarketResearchPhase />} />
                      <Route path="/phase/prototyping" element={<PrototypingPhase />} />
                      <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
                      <Route path="/phase/mvp" element={<MvpPhase />} />
                      <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
                      <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
                      
                      {/* Authenticated Routes */}
                      <Route path="/app" element={<ProtectedRoute><AppDashboard /></ProtectedRoute>} />
                      <Route path="/explore/projects" element={<ProtectedRoute><ProjectsExplorePage /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/profile/:username" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                      <Route path="/profile/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                      <Route path="/settings/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                      <Route path="/community/:id" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                      <Route path="/circles" element={<ProtectedRoute><MyCircles /></ProtectedRoute>} />
                      <Route path="/my-circles" element={<ProtectedRoute><MyCircles /></ProtectedRoute>} />
                      <Route path="/my-network" element={<ProtectedRoute><MyNetwork /></ProtectedRoute>} />
                      <Route path="/messaging" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
                      
                      {/* Search Route */}
                      <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
                      
                      {/* Notifications Route */}
                      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                      
                      {/* Leaderboard Route */}
                      <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                      
                      {/* Admin Routes - Isolated System */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route path="/admin/dashboard" element={<AdminPageErrorBoundary><AdminDashboardHome /></AdminPageErrorBoundary>} />
                      <Route path="/admin/users" element={<AdminPageErrorBoundary><AdminUserManagement /></AdminPageErrorBoundary>} />
                      <Route path="/admin/posts" element={<AdminPageErrorBoundary><AdminPostManagement /></AdminPageErrorBoundary>} />
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
                      <Route path="/admin" element={<AdminPageErrorBoundary><AdminDashboard /></AdminPageErrorBoundary>} />
                      
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
  } catch (error) {
    console.error('App initialization error:', error);
    // Return a basic fallback UI instead of crashing
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h1>
          <p className="text-gray-600 mb-4">There was an error loading the application.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;