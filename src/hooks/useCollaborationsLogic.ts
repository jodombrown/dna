
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
      id: "1",
      title: "Solar Education Initiative",
      description: "Bringing renewable energy education to rural schools across Kenya and Nigeria",
      phase: "Implementation",
      impact_area: "Education & Environment",
      team_size: 12,
      skills_needed: ["Project Management", "Solar Technology", "Education Design"],
      creator: {
        name: "Sarah Okonkwo",
        avatar: null
      },
      collaborators: 12,
      countries: 6,
      totalFunding: "$2.3M",
      currentFunding: "$1.85M",
      progress: 80,
      tags: ["Education", "Renewable Energy", "Infrastructure"],
      timeline: "18 months",
      status: "active",
      stage: "Implementation",
      nextMeeting: "2024-02-15",
      recentUpdate: "Solar panels installed in 15 schools this month"
    },
    {
      id: "2",
      title: "HealthTech Platform",
      description: "Telemedicine platform connecting diaspora doctors with rural patients",
      phase: "Development",
      impact_area: "Healthcare & Technology",
      team_size: 8,
      skills_needed: ["Full-Stack Development", "Healthcare Expertise", "UI/UX Design"],
      creator: {
        name: "Dr. Kwame Asante",
        avatar: null
      },
      collaborators: 8,
      countries: 4,
      totalFunding: "$1.8M",
      currentFunding: "$950K",
      progress: 53,
      tags: ["Healthcare", "Technology", "Telemedicine"],
      timeline: "12 months",
      status: "active",
      stage: "Development",
      nextMeeting: "2024-02-20",
      recentUpdate: "MVP testing completed with 500+ patient consultations"
    },
    {
      id: "3",
      title: "AgriTech Supply Chain",
      description: "Blockchain-based platform for transparent agricultural supply chain management",
      phase: "Scaling",
      impact_area: "Agriculture & Technology",
      team_size: 15,
      skills_needed: ["Blockchain Development", "Supply Chain Management", "Agricultural Knowledge"],
      creator: {
        name: "Amina Diallo",
        avatar: null
      },
      collaborators: 15,
      countries: 8,
      totalFunding: "$3.2M",
      currentFunding: "$2.1M",
      progress: 66,
      tags: ["Agriculture", "Blockchain", "Supply Chain"],
      timeline: "24 months",
      status: "active",
      stage: "Scaling",
      nextMeeting: "2024-02-18",
      recentUpdate: "Onboarded 200+ farmers in Ghana and Nigeria"
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
