
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import AppDashboard from "./pages/App";
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
import BetaSignupComplete from "./pages/BetaSignupComplete";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/app/*" element={<AppDashboard />} />
              <Route path="/contribute" element={<ContributeExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              
                <Route path="/phase/market-research" element={<MarketResearchPhase />} />
                <Route path="/phase/prototyping" element={<PrototypingPhase />} />
                <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
                <Route path="/phase/mvp" element={<MvpPhase />} />
                <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
              <Route path="/beta-signup-complete" element={<BetaSignupComplete />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
