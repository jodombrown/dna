
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Collaborate from './pages/CollaborationsExample';
import ContributionPlatform from './pages/ContributionPlatform';
import EnhancedContributeExample from './pages/EnhancedContributeExample';
import Social from './pages/SocialFeedPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/contribute-example" element={<ContributionPlatform />} />
          <Route path="/contribute-enhanced" element={<EnhancedContributeExample />} />
          <Route path="/social" element={<Social />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
