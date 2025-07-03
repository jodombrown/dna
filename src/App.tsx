
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "./contexts/CleanAuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FunctionalAuth from "./pages/FunctionalAuth";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import EnhancedMessages from "./pages/EnhancedMessages";
import Connect from "./pages/Connect";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import Communities from "./pages/Communities";
import ComingSoon from "./pages/ComingSoon";
import CleanSocialFeedPage from "./pages/CleanSocialFeedPage";
import Search from "./pages/Search";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import ConversationPage from "./pages/ConversationPage";
import Newsletters from "./pages/Newsletters";
import AdminRoleManagement from "./pages/AdminRoleManagement";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MVPPhase from "./pages/MVPPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CleanAuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/functional-auth" element={<FunctionalAuth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/enhanced-messages" element={<EnhancedMessages />} />
            <Route path="/messages/:conversationId" element={<ConversationPage />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/connect-example" element={<ConnectExample />} />
            <Route path="/collaborate-example" element={<CollaborationsExample />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/clean-social-feed" element={<CleanSocialFeedPage />} />
            <Route path="/search" element={<Search />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/newsletters" element={<Newsletters />} />
            <Route path="/admin/roles" element={<AdminRoleManagement />} />
            {/* Phase Routes */}
            <Route path="/phase/market-research" element={<MarketResearchPhase />} />
            <Route path="/phase/prototyping" element={<PrototypingPhase />} />
            <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
            <Route path="/phase/mvp" element={<MVPPhase />} />
            <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
            <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CleanAuthProvider>
  </QueryClientProvider>
);

export default App;
