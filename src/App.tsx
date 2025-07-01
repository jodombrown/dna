

import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Connect from "./pages/Connect";
import ConnectExample from "./pages/ConnectExample";
import CollaborationsExample from "./pages/CollaborationsExample";
import ContributeExample from "./pages/ContributeExample";
import Events from "./pages/Events";
import ComingSoon from "./pages/ComingSoon";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminContentModeration from "./pages/AdminContentModeration";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CleanAuthProvider } from "./contexts/CleanAuthContext";

// Import phase pages
import MarketResearchPhase from "./pages/MarketResearchPhase";
import PrototypingPhase from "./pages/PrototypingPhase";
import CustomerDiscoveryPhase from "./pages/CustomerDiscoveryPhase";
import MvpPhase from "./pages/MvpPhase";
import BetaValidationPhase from "./pages/BetaValidationPhase";
import GoToMarketPhase from "./pages/GoToMarketPhase";

const queryClient = new QueryClient();

const QueryClientWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CleanAuthProvider>
        {children}
        <Toaster />
        <Sonner />
      </CleanAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

function App() {
  return (
    <QueryClientWrapper>
      <BrowserRouter>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Toaster />
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/coming-soon" element={<ComingSoon />} />
            
            {/* Auth */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Core Platform Pages */}
            <Route path="/connect" element={<Connect />} />
            <Route path="/events" element={<Events />} />
            
            {/* Example/Demo Pages */}
            <Route path="/connect-example" element={<ConnectExample />} />
            <Route path="/collaborate-example" element={<CollaborationsExample />} />
            <Route path="/contribute-example" element={<ContributeExample />} />
            
            {/* Development Phase Pages */}
            <Route path="/phase/market-research" element={<MarketResearchPhase />} />
            <Route path="/phase/prototyping" element={<PrototypingPhase />} />
            <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
            <Route path="/phase/mvp" element={<MvpPhase />} />
            <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
            <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
            
            {/* User Profile */}
            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin-user-management" 
              element={
                <ProtectedAdminRoute>
                  <AdminUserManagement />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin-content-moderation" 
              element={
                <ProtectedAdminRoute>
                  <AdminContentModeration />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientWrapper>
  );
}

export default App;

