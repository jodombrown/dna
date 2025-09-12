import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import BadgeToastListener from '@/components/notifications/BadgeToastListener';

// Core pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import InviteSignup from "./pages/InviteSignup";
import UserDashboard from "./pages/UserDashboard";
import AppDashboard from "./pages/AppDashboard";
import NotFound from "./pages/NotFound";

// Static pages  
import About from "./pages/About";
import Contact from "./pages/Contact";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// Example pages
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";


const queryClient = new QueryClient();

// Auth guard component to prevent authenticated users from accessing auth-specific pages only
const AuthGuard = ({ children, redirectAuth = false }: { children: React.ReactNode; redirectAuth?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  // Only redirect authenticated users if this is an auth-specific page
  if (user && redirectAuth) {
    return <Navigate to="/app/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppShell = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    {children}
  </AuthGuard>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              {/* Core authentication */}
              <Route path="/" element={<AuthGuard><Index /></AuthGuard>} />
              <Route path="/auth" element={<AuthGuard redirectAuth><Auth /></AuthGuard>} />
              <Route path="/reset-password" element={<AuthGuard redirectAuth><ResetPassword /></AuthGuard>} />
              
              {/* User profiles */}
              <Route path="/dna/:username" element={<UserDashboard />} />
              
              {/* Main app routes */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="/app/*" element={<AppDashboard />} />
              
              
              {/* Main feature pages */}
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              
              {/* Static pages */}
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              
              {/* Authentication flows */}
              <Route path="/invite" element={<InviteSignup />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BadgeToastListener />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;