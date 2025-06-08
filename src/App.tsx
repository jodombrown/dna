
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
import ProfileConnect from "./pages/ProfileConnect";
import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import Resources from "./pages/Resources";
import Programs from "./pages/Programs";
import InnovationPathways from "./pages/InnovationPathways";
import InnovationPathwayDetail from "./pages/InnovationPathwayDetail";
import PrototypePhase from "./pages/PrototypePhase";
import MvpPhase from "./pages/MvpPhase";
import BuildingPhase from "./pages/BuildingPhase";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/DNA" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/connect/:id" element={<ProfileConnect />} />
            <Route path="/members" element={<Members />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/connect-example" element={<ConnectExample />} />
            <Route path="/collaborations-example" element={<CollaborationsExample />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            <Route path="/events" element={<Events />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/innovation-pathways" element={<InnovationPathways />} />
            <Route path="/innovation-pathways/:pathwayId" element={<InnovationPathwayDetail />} />
            <Route path="/prototype-phase" element={<PrototypePhase />} />
            <Route path="/mvp-phase" element={<MvpPhase />} />
            <Route path="/building-phase" element={<BuildingPhase />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
