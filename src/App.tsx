import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/contexts/CleanAuthContext";
import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import Index from "./pages/Index";
import FunctionalAuth from "./pages/FunctionalAuth";
import UserDashboard from "./pages/UserDashboard";
import MyProfile from "./pages/MyProfile";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSystemSettings from "./pages/AdminSystemSettings";
import SocialFeedPage from "./pages/SocialFeedPage";
import Connect from "./pages/Connect";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminContentModeration from "./pages/AdminContentModeration";
import AdminEventManagement from "./pages/AdminEventManagement";
import AdminCommunityManagement from "@/pages/AdminCommunityManagement";

// Import all your marketing pages
import About from "./pages/About";
import Contact from "./pages/Contact";
import ConnectExample from "./pages/ConnectExample";
import ContributeExample from "./pages/ContributeExample";
import CollaborationsExample from "./pages/CollaborationsExample";

// Import all phase pages
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CleanAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<FunctionalAuth />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/profile/my" element={<MyProfile />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedAdminRoute>
                  <AdminUserManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/moderation" element={
                <ProtectedAdminRoute>
                  <AdminContentModeration />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/events" element={
                <ProtectedAdminRoute>
                  <AdminEventManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedAdminRoute>
                  <AdminSystemSettings />
                </ProtectedAdminRoute>
              } />
              <Route path="/admin/communities" element={
                <ProtectedAdminRoute>
                  <AdminCommunityManagement />
                </ProtectedAdminRoute>
              } />
              <Route path="/social-feed" element={<SocialFeedPage />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile/:id" element={<Profile />} />
              
              {/* Marketing and demo pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/connect-example" element={<ConnectExample />} />
              <Route path="/contribute-example" element={<ContributeExample />} />
              <Route path="/collaborate-example" element={<CollaborationsExample />} />
              
              {/* Phase pages */}
              <Route path="/phase/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase/mvp" element={<MvpPhase />} />
              <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
