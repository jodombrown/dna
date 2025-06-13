
import { useState } from 'react';

interface ContributionPathway {
  id: number;
  title: string;
  description: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  timeLeft: string;
  impactMetric: string;
  category: string;
  urgency: string;
  detailedDescription: string;
  goals: string[];
  timeline: string;
  partnership: string;
}

export const useContributeLogic = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<ContributionPathway | null>(null);

  const contributionPathways: ContributionPathway[] = [
    {
      id: 1,
      title: "Solar Education Initiative",
      description: "Bringing renewable energy education to rural schools",
      type: "Financial Investment",
      targetAmount: 500000,
      currentAmount: 385000,
      contributors: 45,
      timeLeft: "23 days",
      impactMetric: "15,000 students reached",
      category: "Education & Energy",
      urgency: "High",
      detailedDescription: "This initiative focuses on establishing solar energy education programs in rural schools across Kenya and Nigeria. We partner with local educators to develop curriculum and install demonstration solar panels that serve both as learning tools and practical energy sources for the schools.",
      goals: [
        "Install solar education labs in 50 rural schools",
        "Train 200 teachers in renewable energy curriculum",
        "Provide hands-on learning for 15,000 students",
        "Create sustainable energy sources for school operations"
      ],
      timeline: "12-month implementation with quarterly milestones",
      partnership: "Working with local education ministries and renewable energy companies"
    },
    {
      id: 2,
      title: "Telemedicine Platform Development",
      description: "Healthcare access for remote African communities",
      type: "Skills Contribution",
      targetAmount: 300000,
      currentAmount: 180000,
      contributors: 28,
      timeLeft: "45 days",
      impactMetric: "50,000 patients served",
      category: "Healthcare Technology",
      urgency: "Medium",
      detailedDescription: "A comprehensive telemedicine platform connecting diaspora healthcare professionals with patients in remote African communities. The platform includes video consultations, digital health records, and mobile health units for areas with limited internet connectivity.",
      goals: [
        "Connect 500+ diaspora doctors with remote communities",
        "Serve 50,000 patients in first year",
        "Establish 20 mobile health unit partnerships",
        "Create multilingual health education resources"
      ],
      timeline: "18-month development and deployment phase",
      partnership: "Collaborating with African Medical Association and local health ministries"
    },
    {
      id: 3,
      title: "Agricultural Supply Chain Optimization",
      description: "Blockchain-based transparency for farmers",
      type: "Time & Expertise",
      targetAmount: 750000,
      currentAmount: 520000,
      contributors: 67,
      timeLeft: "67 days",
      impactMetric: "5,000 farmers supported",
      category: "Agriculture & Tech",
      urgency: "Low",
      detailedDescription: "A blockchain-powered platform that creates transparency in agricultural supply chains, ensuring farmers receive fair prices while providing consumers with traceability of their food sources. This system reduces middleman exploitation and increases farmer income.",
      goals: [
        "Onboard 5,000 farmers across 5 countries",
        "Establish direct market connections",
        "Implement blockchain tracking for crop-to-consumer journey",
        "Increase farmer income by average 40%"
      ],
      timeline: "24-month rollout with pilot programs in Ghana and Nigeria",
      partnership: "Working with agricultural cooperatives and fintech companies"
    }
  ];

  const myContributions = {
    totalContributed: 127000,
    livesImpacted: 847,
    projectsFunded: 23,
    impactScore: 94
  };

  const impactCategories = [
    { name: "Education", percentage: 35, amount: 44450 },
    { name: "Healthcare", percentage: 28, amount: 35560 },
    { name: "Agriculture", percentage: 22, amount: 27940 },
    { name: "Technology", percentage: 15, amount: 19050 }
  ];

  const handleLearnMore = (pathway: ContributionPathway) => {
    setSelectedPathway(pathway);
    setIsLearnMoreOpen(true);
  };

  return {
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isContributeDialogOpen,
    setIsContributeDialogOpen,
    isLearnMoreOpen,
    setIsLearnMoreOpen,
    selectedPathway,
    contributionPathways,
    myContributions,
    impactCategories,
    handleLearnMore
  };
};
