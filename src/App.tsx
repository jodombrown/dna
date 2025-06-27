
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Members from './pages/Members';
import MyProfile from './pages/MyProfile';
import MarketResearchPhase from './pages/MarketResearchPhase';
import PrototypingPhase from './pages/PrototypingPhase';
import CustomerDiscoveryPhase from './pages/CustomerDiscoveryPhase';
import MvpPhase from './pages/MvpPhase';
import BetaValidationPhase from './pages/BetaValidationPhase';
import GoToMarketPhase from './pages/GoToMarketPhase';
import BuildPhase from './pages/BuildPhase';
import ConnectExample from './pages/ConnectExample';
import CollaborationsExample from './pages/CollaborationsExample';
import ContributeExample from './pages/ContributeExample';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';
import OnboardingWizard from './pages/OnboardingWizard';
import SocialFeedPage from './pages/SocialFeedPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/members" element={<Members />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/market-research-phase" element={<MarketResearchPhase />} />
              <Route path="/prototyping-phase" element={<PrototypingPhase />} />
              <Route path="/customer-discovery-phase" element={<CustomerDiscoveryPhase />} />
              <Route path="/mvp-phase" element={<MvpPhase />} />
              <Route path="/beta-validation-phase" element={<BetaValidationPhase />} />
              <Route path="/go-to-market-phase" element={<GoToMarketPhase />} />
              <Route path="/build-phase" element={<BuildPhase />} />
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding-wizard" element={<OnboardingWizard />} />
              <Route path="/social-feed" element={<SocialFeedPage />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
