
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "./components/app/ErrorBoundary";
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
import ProtectedRoute from "./components/app/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <AuthProvider>
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
              
              {/* Admin Routes - Isolated System */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardHome />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin" element={<AdminDashboard />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
