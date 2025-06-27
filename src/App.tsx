
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
              {/* Main landing page */}
              <Route path="/" element={<Index />} />
              
              {/* Public landing/marketing pages */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/connect" element={<ConnectExample />} />
              <Route path="/collaborate" element={<CollaborationsExample />} />
              <Route path="/contribute" element={<ContributeExample />} />
              
              {/* Phase pages (renamed to phase-1 through phase-6) */}
              <Route path="/phase-1" element={<MarketResearchPhase />} />
              <Route path="/phase-2" element={<PrototypingPhase />} />
              <Route path="/phase-3" element={<CustomerDiscoveryPhase />} />
              <Route path="/phase-4" element={<MvpPhase />} />
              <Route path="/phase-5" element={<BetaValidationPhase />} />
              <Route path="/phase-6" element={<GoToMarketPhase />} />
              
              {/* Authentication and user pages */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/members" element={<Members />} />
              <Route path="/my-profile" element={<MyProfile />} />
              <Route path="/onboarding-wizard" element={<OnboardingWizard />} />
              <Route path="/social-feed" element={<SocialFeedPage />} />
              
              {/* Admin */}
              <Route path="/admin-login" element={<AdminLogin />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
