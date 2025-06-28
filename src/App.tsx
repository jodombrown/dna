
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/contexts/CleanAuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import SocialFeedPage from "./pages/SocialFeedPage";
import AdminPhaseDashboard from "./pages/AdminPhaseDashboard";
import Connect from "./pages/Connect";
import Collaborate from "./pages/Collaborate";
import Contribute from "./pages/Contribute";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";

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
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/social-feed" element={<SocialFeedPage />} />
              <Route path="/admin-phase-dashboard" element={<AdminPhaseDashboard />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/collaborate" element={<Collaborate />} />
              <Route path="/contribute" element={<Contribute />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CleanAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
