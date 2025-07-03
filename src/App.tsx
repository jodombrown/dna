
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "./contexts/CleanAuthContext";
import Index from "./pages/Index";
import EnhancedAbout from "./pages/EnhancedAbout";
import EnhancedContact from "./pages/EnhancedContact";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import Auth from "./pages/Auth";
import FunctionalAuth from "./pages/FunctionalAuth";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import ComingSoon from "./pages/ComingSoon";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminEventManagement from "./pages/AdminEventManagement";
import AdminContentModeration from "./pages/AdminContentModeration";
import AdminCommunityManagement from "./pages/AdminCommunityManagement";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
import AdminAuditLog from "./pages/AdminAuditLog";
import AdminSystemSettings from "./pages/AdminSystemSettings";
import AdminAdvancedSettings from "./pages/AdminAdvancedSettings";
import AdminDataSeeder from "./pages/AdminDataSeeder";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CleanAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<EnhancedAbout />} />
            <Route path="/contact" element={<EnhancedContact />} />
            <Route path="/connect-example" element={<ConnectExample />} />
            <Route path="/collaborate-example" element={<CollaborationsExample />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/functional-auth" element={<FunctionalAuth />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/profile/my" element={<MyProfile />} />
            <Route path="/coming-soon" element={<ComingSoon />} />

            {/* Phase Pages */}
            <Route path="/phase/market-research" element={<MarketResearchPhase />} />
            <Route path="/phase/prototyping" element={<PrototypingPhase />} />
            <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
            <Route path="/phase/mvp" element={<MvpPhase />} />
            <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
            <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />

            {/* Admin Pages */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/events" element={<AdminEventManagement />} />
            <Route path="/admin/content" element={<AdminContentModeration />} />
            <Route path="/admin/communities" element={<AdminCommunityManagement />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />
            <Route path="/admin/audit" element={<AdminAuditLog />} />
            <Route path="/admin/settings" element={<AdminSystemSettings />} />
            <Route path="/admin/advanced" element={<AdminAdvancedSettings />} />
            <Route path="/admin/seeder" element={<AdminDataSeeder />} />

            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CleanAuthProvider>
  </QueryClientProvider>
);

export default App;
