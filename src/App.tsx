
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import MyProfile from "./pages/MyProfile";
import Members from "./pages/Members";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProfileConnect from "./pages/ProfileConnect";
import InnovationPathwayDetail from "./pages/InnovationPathwayDetail";
import InnovationPathways from "./pages/InnovationPathways";
import Programs from "./pages/Programs";
import Events from "./pages/Events";
import Resources from "./pages/Resources";
import Services from "./pages/Services";
import Opportunities from "./pages/Opportunities";
import ComingSoon from "./pages/ComingSoon";
import PrototypingPhase from "./pages/PrototypingPhase";
import BuildPhase from "./pages/BuildPhase";
import MvpPhase from "./pages/MvpPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";
import CollaborationsExample from "./pages/CollaborationsExample";
import ConnectExample from "./pages/ConnectExample";
import ContributeExample from "./pages/ContributeExample";
import About from "./pages/About";
import Contact from "./pages/Contact";
import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

// Component to handle scroll restoration
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const isFirstLoad = useRef(true);

  useLayoutEffect(() => {
    // On page refresh or first load, always scroll to top
    if (isFirstLoad.current || performance.navigation.type === 1) {
      window.scrollTo(0, 0);
      isFirstLoad.current = false;
      return;
    }

    // For normal navigation, restore scroll position if it exists
    const savedPosition = sessionStorage.getItem(`scroll-${pathname}`);
    if (savedPosition) {
      const position = parseInt(savedPosition, 10);
      window.scrollTo(0, position);
    } else {
      // If no saved position, scroll to top
      window.scrollTo(0, 0);
    }

    // Save scroll position when leaving the page
    const handleBeforeUnload = () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Also save on route changes
    return () => {
      sessionStorage.setItem(`scroll-${pathname}`, window.scrollY.toString());
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/prototyping-phase" element={<PrototypingPhase />} />
            <Route path="/build-phase" element={<BuildPhase />} />
            <Route path="/mvp-phase" element={<MvpPhase />} />
            <Route path="/customer-discovery-phase" element={<CustomerDiscoveryPhase />} />
            <Route path="/go-to-market-phase" element={<GoToMarketPhase />} />
            <Route path="/collaborations-example" element={<CollaborationsExample />} />
            <Route path="/connect-example" element={<ConnectExample />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-profile" element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <Members />
              </ProtectedRoute>
            } />
            <Route path="/opportunities" element={
              <ProtectedRoute>
                <Opportunities />
              </ProtectedRoute>
            } />
            <Route path="/innovation-pathways" element={
              <ProtectedRoute>
                <InnovationPathways />
              </ProtectedRoute>
            } />
            <Route path="/profile/:id" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/connect/:id" element={
              <ProtectedRoute>
                <ProfileConnect />
              </ProtectedRoute>
            } />
            <Route path="/innovation/:id" element={
              <ProtectedRoute>
                <InnovationPathwayDetail />
              </ProtectedRoute>
            } />
            <Route path="/programs" element={
              <ProtectedRoute>
                <Programs />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/resources" element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute>
                <Services />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
