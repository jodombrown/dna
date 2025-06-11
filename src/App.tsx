
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import Members from "./pages/Members";
import Search from "./pages/Search";
import Messages from "./pages/Messages";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Programs from "./pages/Programs";
import Resources from "./pages/Resources";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import InnovationPathways from "./pages/InnovationPathways";
import InnovationPathwayDetail from "./pages/InnovationPathwayDetail";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BuildPhase from "./pages/BuildPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/my-profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
              <Route path="/members" element={<Members />} />
              <Route path="/search" element={<Search />} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              <Route path="/connect-example" element={<ConnectExample />} />
              <Route path="/collaborations-example" element={<CollaborationsExample />} />
              <Route path="/contribute-example" element={<ContributeExample />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/services" element={<Services />} />
              <Route path="/programs" element={<Programs />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/events" element={<Events />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/innovation-pathways" element={<InnovationPathways />} />
              <Route path="/innovation-pathways/:id" element={<InnovationPathwayDetail />} />
              <Route path="/prototyping-phase" element={<PrototypingPhase />} />
              <Route path="/customer-discovery-phase" element={<CustomerDiscoveryPhase />} />
              <Route path="/mvp-phase" element={<MvpPhase />} />
              <Route path="/build-phase" element={<BuildPhase />} />
              <Route path="/go-to-market-phase" element={<GoToMarketPhase />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
