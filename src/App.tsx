
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CleanAuthProvider } from "@/contexts/CleanAuthContext";
import Index from "./pages/Index";
import Connect from "./pages/Connect";
import CollaborationsExample from "./pages/CollaborationsExample";
import Events from "./pages/Events";
import Calendar from "./pages/Calendar";
import EnhancedSearch from "./pages/EnhancedSearch";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import ComingSoon from "./pages/ComingSoon";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function QueryClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function App() {
  return (
    <QueryClientWrapper>
      <TooltipProvider>
        <CleanAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/collaborations" element={<CollaborationsExample />} />
              <Route path="/events" element={<Events />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/search" element={<EnhancedSearch />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                } 
              />
              <Route path="/newsletter" element={<ComingSoon />} />
            </Routes>
          </BrowserRouter>
        </CleanAuthProvider>
      </TooltipProvider>
    </QueryClientWrapper>
  );
}

export default App;
