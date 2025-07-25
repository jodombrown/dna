
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';
import WaitlistPopup from '@/components/waitlist/WaitlistPopup';
import { useWaitlistPopup } from '@/hooks/useWaitlistPopup';
import NewHeroSection from '@/components/homepage/NewHeroSection';
import HowItWorksSection from '@/components/homepage/HowItWorksSection';
import PillarsSection from '@/components/homepage/PillarsSection';
import DiasporaStatsSection from '@/components/homepage/DiasporaStatsSection';
import UserActionPreviewsSection from '@/components/homepage/UserActionPreviewsSection';
import JoinBannerSection from '@/components/homepage/JoinBannerSection';

const Index = () => {
  useScrollToTop();
  const { showWaitlistPopup, closeWaitlistPopup } = useWaitlistPopup();

  const homepageData = {
    hero_section: {
      headline: "The Future Lies Beyond Remittances",
      subheadline: "The diaspora didn't just send money—they sent hope, opportunity, and the tools for transformation. Now, we build a global platform for collective action.",
      cta_buttons: [
        {
          label: "Start Your Journey",
          link_to: "/connect",
          style: "primary" as const
        },
        {
          label: "Join the Beta",
          link_to: "/waitlist",
          style: "secondary" as const
        }
      ]
    },
    how_it_works: {
      title: "How DNA Works",
      steps: [
        {
          icon: "user-plus" as const,
          title: "Create Your Profile",
          description: "Tell us about your expertise, interests, and diaspora story."
        },
        {
          icon: "rocket" as const,
          title: "Join or Launch an Initiative",
          description: "Collaborate with others around shared goals and challenges."
        },
        {
          icon: "heart-hand" as const,
          title: "Contribute to Impact",
          description: "Use your skills, capital, or connections to move Africa forward."
        }
      ]
    },
    pillars: {
      title: "Our Framework",
      description: "Three core pillars guide everything we do on DNA.",
      sections: [
        {
          title: "Connect",
          description: "Discover professionals and communities shaping Africa's future.",
          link_to: "/connect"
        },
        {
          title: "Collaborate",
          description: "Join forces on initiatives solving real problems across the continent.",
          link_to: "/collaborate"
        },
        {
          title: "Contribute",
          description: "Invest your skills, capital, or support where it matters most.",
          link_to: "/contribute"
        }
      ]
    },
    diaspora_stats: {
      title: "The African Diaspora at a Glance",
      stats: [
        { label: "Diaspora Size", value: "44M+" },
        { label: "Annual Remittances", value: "$22B+" },
        { label: "College-Educated", value: "47%" },
        { label: "Ready to Engage", value: "Millions" }
      ]
    },
    user_action_previews: {
      title: "What's Happening Now",
      updates: [
        "🌍 18 New Professionals Joined This Week",
        "📈 4 New Initiatives Launched in Education & Clean Energy",
        "🤝 Contributions from 12 Countries This Month"
      ]
    },
    join_banner: {
      text: "Be part of the movement. Join DNA's early beta community and help shape the future.",
      button_text: "Join the Beta",
      button_link: "/waitlist"
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <Header />

      {/* Prototype Banner */}
      <PrototypeBanner />

      {/* Hero Section */}
      <NewHeroSection 
        {...homepageData.hero_section}
        onJoinBeta={closeWaitlistPopup}
      />

      {/* How It Works Section */}
      <HowItWorksSection {...homepageData.how_it_works} />

      {/* Pillars Section */}
      <PillarsSection {...homepageData.pillars} />

      {/* Diaspora Stats Section */}
      <DiasporaStatsSection {...homepageData.diaspora_stats} />

      {/* User Action Previews Section */}
      <UserActionPreviewsSection {...homepageData.user_action_previews} />

      {/* Join Banner Section */}
      <JoinBannerSection 
        {...homepageData.join_banner}
        onJoinClick={closeWaitlistPopup}
      />

      <Footer />
      
      <WaitlistPopup 
        isOpen={showWaitlistPopup}
        onClose={closeWaitlistPopup}
      />
    </div>
  );
};

export default Index;
