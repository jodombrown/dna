import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Collaborate from './pages/Collaborate';
import ContributeExample from './pages/ContributeExample';
import GetStarted from './pages/GetStarted';
import Social from './pages/Social';
import CleanSocial from './pages/CleanSocial';
import EnhancedContributeExample from './pages/EnhancedContributeExample';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collaborate" element={<Collaborate />} />
          <Route path="/contribute-example" element={<ContributeExample />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/social" element={<Social />} />
          <Route path="/clean-social" element={<CleanSocial />} />
          <Route path="/contribute-enhanced" element={<EnhancedContributeExample />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
