
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/contexts/CleanAuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FunctionalAuth from "./pages/FunctionalAuth";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import UserProfile from "./pages/UserProfile";
import Connect from "./pages/Connect";
import ConnectExample from "./pages/ConnectExample";
import ContributeExample from "./pages/ContributeExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import Events from "./pages/Events";
import Messages from "./pages/Messages";
import ConversationPage from "./pages/ConversationPage";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import About from "./pages/About";
import EnhancedAbout from "./pages/EnhancedAbout";
import EnhancedContact from "./pages/EnhancedContact";
import CleanSocialFeedPage from "./pages/CleanSocialFeedPage";
import Notifications from "./pages/Notifications";
import Saved from "./pages/Saved";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import MyCommunities from "./pages/MyCommunities";
import Opportunities from "./pages/Opportunities";
import JobsMatched from "./pages/JobsMatched";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import Newsletters from "./pages/Newsletters";

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
              <Route path="/auth" element={<Auth />} />
              <Route path="/functional-auth" element={<FunctionalAuth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/my" element={<MyProfile />} />
              <Route path="/profile/:userId" element={<UserProfile />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/connect-example" element={<ConnectExample />} />
              <Route path="/contribute-example" element={<ContributeExample />} />
              <Route path="/collaborations-example" element={<CollaborationsExample />} />
              <Route path="/events" element={<Events />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<ConversationPage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/enhanced-about" element={<EnhancedAbout />} />
              <Route path="/enhanced-contact" element={<EnhancedContact />} />
              <Route path="/feed" element={<CleanSocialFeedPage />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<CommunityDetail />} />
              <Route path="/my-communities" element={<MyCommunities />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/jobs/matched" element={<JobsMatched />} />
              <Route path="/phase/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase/mvp" element={<MvpPhase />} />
              <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
              <Route path="/newsletters" element={<Newsletters />} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalyticsDashboard /></ProtectedAdminRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
