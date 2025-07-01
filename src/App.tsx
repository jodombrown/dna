
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import CollaborationsExample from './pages/CollaborationsExample';
import ContributeExample from './pages/ContributeExample';
import Onboarding from './pages/Onboarding';
import SocialFeedPage from './pages/SocialFeedPage';
import CleanSocialFeedPage from './pages/CleanSocialFeedPage';
import EnhancedContributeExample from './pages/EnhancedContributeExample';
import MyProfile from './pages/MyProfile';
import OnboardingWizard from './pages/OnboardingWizard';
import NotFound from './pages/NotFound';
import Messages from './pages/Messages';
import Search from './pages/Search';
import Profile from './pages/Profile';
import Opportunities from './pages/Opportunities';
import InnovationPathways from './pages/InnovationPathways';
import Members from './pages/Members';
import UserDashboard from './pages/UserDashboard';
import Programs from './pages/Programs';
import PrototypingPhase from './pages/PrototypingPhase';
import MarketResearchPhase from './pages/MarketResearchPhase';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Connect from './pages/Connect';
import ConnectExample from './pages/ConnectExample';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/connect-example" element={<ConnectExample />} />
          <Route path="/collaborate" element={<CollaborationsExample />} />
          <Route path="/collaborate-example" element={<CollaborationsExample />} />
          <Route path="/contribute-example" element={<ContributeExample />} />
          <Route path="/contribute-enhanced" element={<EnhancedContributeExample />} />
          <Route path="/get-started" element={<Onboarding />} />
          <Route path="/social" element={<SocialFeedPage />} />
          <Route path="/clean-social" element={<CleanSocialFeedPage />} />
          <Route path="/profile/my" element={<MyProfile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/onboarding-wizard" element={<OnboardingWizard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/search" element={<Search />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/innovation" element={<InnovationPathways />} />
          <Route path="/members" element={<Members />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/phase/prototyping" element={<PrototypingPhase />} />
          <Route path="/phase/market-research" element={<MarketResearchPhase />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
