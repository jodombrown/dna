
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import Connect from "./pages/Connect";
import Members from "./pages/Members";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDataSeeder from "./pages/AdminDataSeeder";
import Onboarding from "./pages/Onboarding";
import OnboardingWizard from "./pages/OnboardingWizard";
import SocialFeedPage from "./pages/SocialFeedPage";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import Resources from "./pages/Resources";
import Programs from "./pages/Programs";
import Services from "./pages/Services";
import InnovationPathways from "./pages/InnovationPathways";
import InnovationPathwayDetail from "./pages/InnovationPathwayDetail";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import ProfileConnect from "./pages/ProfileConnect";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";

// Phase pages
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import MvpPhase from "./pages/MvpPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/members" element={<Members />} />
              <Route path="/search" element={<Search />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/data-seeder" element={<AdminDataSeeder />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/onboarding-wizard" element={<OnboardingWizard />} />
              <Route path="/social" element={<SocialFeedPage />} />
              <Route path="/events" element={<Events />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/innovation-pathways" element={<InnovationPathways />} />
              <Route path="/innovation-pathway/:id" element={<InnovationPathwayDetail />} />
              <Route path="/connect-example" element={<ConnectExample />} />
              <Route path="/collaborate-example" element={<CollaborationsExample />} />
              <Route path="/contribute-example" element={<ContributeExample />} />
              <Route path="/profile-connect" element={<ProfileConnect />} />
              
              {/* Phase routes */}
              <Route path="/phase/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase/mvp" element={<MvpPhase />} />
              <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
              
              {/* Coming soon pages */}
              <Route path="/collaborate" element={<ComingSoon />} />
              <Route path="/contribute" element={<ComingSoon />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
