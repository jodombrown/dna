
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Connect from "./pages/Connect";
import Events from "./pages/Events";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUserManagement from "./pages/AdminUserManagement";
import AdminContentModeration from "./pages/AdminContentModeration";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import { CleanAuthProvider } from "./contexts/CleanAuthContext";

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
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/connect" element={<Connect />} />
            <Route path="/events" element={<Events />} />
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
