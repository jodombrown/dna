
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Connect from '@/pages/Connect';
import Collaborate from '@/pages/Collaborate';
import Contribute from '@/pages/Contribute';
import Profile from '@/pages/Profile';
import MyProfile from '@/pages/MyProfile';
import Members from '@/pages/Members';
import Messages from '@/pages/Messages';
import SocialFeedPage from '@/pages/SocialFeedPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminDataSeeder from '@/pages/AdminDataSeeder';
import AdminProfileSwitcherPage from '@/pages/AdminProfileSwitcher';
import AdminTestingDashboard from '@/pages/AdminTestingDashboard';
import MarketResearchPhase from '@/pages/MarketResearchPhase';
import PrototypingPhase from '@/pages/PrototypingPhase';
import CustomerDiscoveryPhase from '@/pages/CustomerDiscoveryPhase';
import MVPPhase from '@/pages/MVPPhase';
import BetaValidationPhase from '@/pages/BetaValidationPhase';
import GoToMarketPhase from '@/pages/GoToMarketPhase';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/connect" element={<Connect />} />
              <Route path="/collaborate" element={<Collaborate />} />
              <Route path="/contribute" element={<Contribute />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/members" element={<Members />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/social" element={<SocialFeedPage />} />
              
              {/* Phase Routes */}
              <Route path="/phase/market-research" element={<MarketResearchPhase />} />
              <Route path="/phase/prototyping" element={<PrototypingPhase />} />
              <Route path="/phase/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase/mvp" element={<MVPPhase />} />
              <Route path="/phase/beta-validation" element={<BetaValidationPhase />} />
              <Route path="/phase/go-to-market" element={<GoToMarketPhase />} />
              
              {/* Admin Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/data-seeder" element={<AdminDataSeeder />} />
              <Route path="/admin/profile-switcher" element={<AdminProfileSwitcherPage />} />
              <Route path="/admin/testing" element={<AdminTestingDashboard />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
