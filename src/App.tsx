
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import CollaborationsExample from './pages/CollaborationsExample';
import ContributeExample from './pages/ContributeExample';
import Onboarding from './pages/Onboarding';
import SocialFeedPage from './pages/SocialFeedPage';
import CleanSocialFeedPage from './pages/CleanSocialFeedPage';
import EnhancedContributeExample from './pages/EnhancedContributeExample';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collaborate" element={<CollaborationsExample />} />
          <Route path="/contribute-example" element={<ContributeExample />} />
          <Route path="/get-started" element={<Onboarding />} />
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="/clean-social" element={<CleanSocialFeedPage />} />
          <Route path="/contribute-enhanced" element={<EnhancedContributeExample />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
