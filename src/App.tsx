
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ContributeExample from "./pages/ContributeExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import Contact from "./pages/Contact";
import About from "./pages/About";
import EnhancedAbout from "./pages/EnhancedAbout";
import EnhancedContact from "./pages/EnhancedContact";
import AdminAnalyticsDashboard from "./pages/AdminAnalyticsDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import DemoDataSeederPage from "./pages/DemoDataSeeder";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            <Route path="/collaborate-example" element={<CollaborationsExample />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/enhanced-about" element={<EnhancedAbout />} />
            <Route path="/enhanced-contact" element={<EnhancedContact />} />
            
              <Route path="/phase/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase/mvp" element={<MvpPhase />} />
              <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
            <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
            <Route path="/demo-data" element={<DemoDataSeederPage />} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/analytics" element={<ProtectedAdminRoute><AdminAnalyticsDashboard /></ProtectedAdminRoute>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
