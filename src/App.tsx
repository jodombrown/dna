
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import About from './pages/About';
import Contact from './pages/Contact';
import Members from './pages/Members';
import PrototypingPhase from './pages/PrototypingPhase';
import BuildPhase from './pages/BuildPhase';
import MvpPhase from './pages/MvpPhase';
import CustomerDiscoveryPhase from './pages/CustomerDiscoveryPhase';
import GoToMarketPhase from './pages/GoToMarketPhase';
import CollaborationsExample from './pages/CollaborationsExample';
import ContributeExample from './pages/ContributeExample';
import AdminLogin from './pages/AdminLogin';
import Auth from './pages/Auth';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/members" element={<Members />} />
              <Route path="/prototyping" element={<PrototypingPhase />} />
              <Route path="/build" element={<BuildPhase />} />
              <Route path="/mvp" element={<MvpPhase />} />
              <Route path="/customer-discovery" element={<CustomerDiscoveryPhase />} />
              <Route path="/go-to-market" element={<GoToMarketPhase />} />
              <Route path="/collaborations-example" element={<CollaborationsExample />} />
              <Route path="/contribute-example" element={<ContributeExample />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
