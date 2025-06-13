
import { useState, useEffect } from 'react';

export const useCollaborationsLogic = () => {
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [isDiscussionDialogOpen, setIsDiscussionDialogOpen] = useState(false);
  const [isDocumentsDialogOpen, setIsDocumentsDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const activeProjects = [
    {
      id: 1,
      title: "Solar Education Initiative",
      description: "Bringing renewable energy education to rural schools across Kenya and Nigeria",
      collaborators: 12,
      countries: 6,
      totalFunding: 2300000,
      currentFunding: 1850000,
      progress: 80,
      stage: "Implementation",
      nextMeeting: "2024-02-15",
      recentUpdate: "Solar panels installed in 15 schools this month",
      tags: ["Education", "Renewable Energy", "Infrastructure"]
    },
    {
      id: 2,
      title: "HealthTech Platform",
      description: "Telemedicine platform connecting diaspora doctors with rural patients",
      collaborators: 8,
      countries: 4,
      totalFunding: 1800000,
      currentFunding: 950000,
      progress: 53,
      stage: "Development",
      nextMeeting: "2024-02-20",
      recentUpdate: "MVP testing completed with 500+ patient consultations",
      tags: ["Healthcare", "Technology", "Telemedicine"]
    },
    {
      id: 3,
      title: "AgriTech Supply Chain",
      description: "Blockchain-based platform for transparent agricultural supply chain management",
      collaborators: 15,
      countries: 8,
      totalFunding: 3200000,
      currentFunding: 2100000,
      progress: 66,
      stage: "Scaling",
      nextMeeting: "2024-02-18",
      recentUpdate: "Onboarded 200+ farmers in Ghana and Nigeria",
      tags: ["Agriculture", "Blockchain", "Supply Chain"]
    }
  ];

  const stats = {
    totalCollaborators: 35,
    countriesInvolved: 18,
    totalFunding: "$7.3M",
    avgProgress: 66
  };

  return {
    activeProjects,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isDiscussionDialogOpen,
    setIsDiscussionDialogOpen,
    isDocumentsDialogOpen,
    setIsDocumentsDialogOpen,
    isMeetingDialogOpen,
    setIsMeetingDialogOpen
  };
};
