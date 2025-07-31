
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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

// Auth guard component to prevent authenticated users from accessing auth/marketing pages
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (user) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard><Auth /></AuthGuard>} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/app/*" element={<AppDashboard />} />
              <Route path="/contribute" element={<AuthGuard><ContributeExample /></AuthGuard>} />
              <Route path="/collaborate" element={<AuthGuard><CollaborationsExample /></AuthGuard>} />
              <Route path="/connect" element={<AuthGuard><ConnectExample /></AuthGuard>} />
              <Route path="/contact" element={<AuthGuard><Contact /></AuthGuard>} />
              <Route path="/about" element={<AuthGuard><About /></AuthGuard>} />
              
              <Route path="/phase/market-research" element={<AuthGuard><MarketResearchPhase /></AuthGuard>} />
              <Route path="/phase/prototyping" element={<AuthGuard><PrototypingPhase /></AuthGuard>} />
              <Route path="/phase/customer-discovery" element={<AuthGuard><CustomerDiscoveryPhase /></AuthGuard>} />
              <Route path="/phase/mvp" element={<AuthGuard><MvpPhase /></AuthGuard>} />
              <Route path="/phase/beta-validation" element={<AuthGuard><BetaValidationPhase /></AuthGuard>} />
              <Route path="/phase/go-to-market" element={<AuthGuard><GoToMarketPhase /></AuthGuard>} />
              <Route path="/beta-signup-complete" element={<AuthGuard><BetaSignupComplete /></AuthGuard>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
