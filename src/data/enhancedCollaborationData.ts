import { CollaborationProject, CollaborationStats } from '@/types/collaborationTypes';
import { extendedCollaborationProjects } from './extendedCollaborationData';

export const enhancedCollaborationProjects: CollaborationProject[] = [
  {
    id: "1",
    title: "African Fintech Innovation Hub",
    description: "Revolutionary blockchain-based payment infrastructure connecting rural communities across 15 African countries to the global digital economy.",
    impact_area: "fintech",
    region: "west-africa",
    countries: ["Ghana", "Nigeria", "Senegal"],
    contribution_types: ["funding", "technical-skills", "business-expertise"],
    skills_needed: ["Blockchain Development", "Mobile Banking", "Regulatory Compliance", "UI/UX Design"],
    team_size: 45,
    collaborators: 38,
    funding_goal: 15000000, // $15M
    current_funding: 12800000, // $12.8M (85% funded)
    progress: 85,
    status: "scaling",
    urgency: "high",
    time_commitment: "full-time",
    creator: {
      name: "Kwame Asante",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80",
      title: "Fintech Entrepreneur"
    },
    collaborator_avatars: [
      { color: "#16a34a" }, // green
      { color: "#ea580c" }, // orange
      { color: "#eab308" }, // yellow
    ],
    tags: ["Blockchain", "Mobile Payments", "Financial Inclusion", "Rural Banking"],
    timeline: "24 months",
    next_milestone: "Launch in 3 new countries",
    recent_update: "Successfully processed $50M+ in transactions, expanding to Tanzania and Kenya next quarter",
    image_url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=300&fit=crop",
    created_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "2", 
    title: "Solar Energy Access Initiative - COMPLETED",
    description: "Comprehensive solar infrastructure program that successfully brought clean electricity to 500+ villages across East Africa, impacting over 2 million lives.",
    impact_area: "cleantech",
    region: "east-africa",
    countries: ["Kenya", "Tanzania", "Uganda"],
    contribution_types: ["funding", "technical-skills", "operations"],
    skills_needed: ["Solar Engineering", "Project Management", "Community Engagement", "Energy Storage"],
    team_size: 62,
    collaborators: 55,
    funding_goal: 25000000, // $25M
    current_funding: 25000000, // $25M (100% funded - COMPLETED)
    progress: 100,
    status: "completed",
    urgency: "low",
    time_commitment: "part-time",
    creator: {
      name: "Amara Okonkwo",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332e234?w=80",
      title: "Clean Energy Engineer"
    },
    collaborator_avatars: [
      { color: "#22c55e" }, // green
      { color: "#f97316" }, // orange  
      { color: "#a855f7" }, // purple
    ],
    tags: ["Solar Power", "Rural Electrification", "Sustainable Development", "Energy Access"],
    timeline: "36 months",
    next_milestone: "Project completed - Maintenance phase",
    recent_update: "SUCCESS: All 500 villages electrified! 2.1M people now have clean electricity access. Project completed 3 months ahead of schedule.",
    image_url: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=500&h=300&fit=crop",
    created_at: "2023-06-10T00:00:00Z"
  },
  {
    id: "3",
    title: "Pan-African Agri-Supply Chain Revolution",
    description: "Blockchain-based platform ensuring transparent agricultural supply chain management from farm to market across multiple African countries.",
    impact_area: "agritech",
    region: "west-africa",
    countries: ["Nigeria", "Ghana", "Ivory Coast"],
    contribution_types: ["technical-skills", "business-expertise", "funding"],
    skills_needed: ["Blockchain Development", "Supply Chain Management", "Agricultural Technology", "Data Analytics"],
    team_size: 32,
    collaborators: 28,
    funding_goal: 8500000, // $8.5M
    current_funding: 7140000, // $7.14M (84% funded)
    progress: 84,
    status: "scaling",
    urgency: "high",
    time_commitment: "full-time",
    creator: {
      name: "Chinwe Okoro",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80",
      title: "AgriTech Innovator"
    },
    collaborator_avatars: [
      { color: "#10b981" }, // emerald
      { color: "#f59e0b" }, // amber
      { color: "#ef4444" }, // red
    ],
    tags: ["Supply Chain", "Agriculture", "Blockchain", "Food Security"],
    timeline: "18 months",
    next_milestone: "Deploy in 100 farming cooperatives",
    recent_update: "Pilot shows 25% reduction in post-harvest losses, 30% farmer income increase. Expanding to Ivory Coast.",
    image_url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop",
    created_at: "2024-01-08T00:00:00Z"
  },
  {
    id: "4",
    title: "Digital Health Network - COMPLETED SUCCESS",
    description: "Comprehensive telemedicine platform that successfully connected 10,000+ healthcare workers across rural African communities. Project exceeded all targets.",
    impact_area: "healthtech",
    region: "east-africa",
    countries: ["Tanzania", "Rwanda", "Uganda"],
    contribution_types: ["technical-skills", "mentorship", "operations"],
    skills_needed: ["Healthcare Technology", "Mobile Development", "Medical Training", "Data Security"],
    team_size: 28,
    collaborators: 25,
    funding_goal: 6000000, // $6M
    current_funding: 6000000, // $6M (100% funded - COMPLETED)
    progress: 100,
    status: "completed",
    urgency: "low",
    time_commitment: "flexible",
    creator: {
      name: "Dr. Grace Mwangi",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80",
      title: "Digital Health Director"
    },
    tags: ["Telemedicine", "Healthcare Access", "Rural Health", "Medical Technology"],
    timeline: "24 months",
    next_milestone: "Project completed - Ongoing support phase",
    recent_update: "OUTSTANDING SUCCESS! 12,000 healthcare workers trained, 500,000+ patients served. All KPIs exceeded by 20%.",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=500&h=300&fit=crop",
    created_at: "2023-01-20T00:00:00Z"
  },
  {
    id: "5",
    title: "Next-Gen African EdTech Platform",
    description: "AI-powered educational platform providing personalized learning experiences to 2 million students across 20 African countries with cutting-edge technology.",
    impact_area: "edtech",
    region: "north-africa",
    countries: ["Egypt", "Morocco", "Tunisia"],
    contribution_types: ["technical-skills", "funding", "mentorship"],
    skills_needed: ["Artificial Intelligence", "Educational Design", "Mobile Development", "Content Creation"],
    team_size: 55,
    collaborators: 48,
    funding_goal: 18000000, // $18M
    current_funding: 14400000, // $14.4M (80% funded)
    progress: 80,
    status: "scaling",
    urgency: "medium",
    time_commitment: "full-time",
    creator: {
      name: "Ahmed Hassan",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80",
      title: "EdTech Visionary"
    },
    tags: ["AI Education", "E-Learning", "Digital Literacy", "Student Success"],
    timeline: "30 months",
    next_milestone: "Launch AI tutoring system in 5 new countries",
    recent_update: "Platform active in 15 countries, 1.8M students enrolled with 92% retention rate",
    image_url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=500&h=300&fit=crop",
    created_at: "2024-02-05T00:00:00Z"
  },
  {
    id: "6",
    title: "Smart City Infrastructure - UNDERPERFORMING",
    description: "IoT-based smart city solutions for traffic management, waste collection, and energy optimization in Nairobi. Project facing significant delays and funding challenges.",
    impact_area: "infrastructure",
    region: "east-africa",
    countries: ["Kenya"],
    contribution_types: ["technical-skills", "funding", "operations"],
    skills_needed: ["IoT Development", "Urban Planning", "Data Analytics", "Systems Integration"],
    team_size: 18,
    collaborators: 12,
    funding_goal: 12000000, // $12M
    current_funding: 3600000, // $3.6M (30% funded - UNDERPERFORMING)
    progress: 30,
    status: "active",
    urgency: "high",
    time_commitment: "full-time",
    creator: {
      name: "Peter Kiprotich",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80",
      title: "Smart City Architect"
    },
    tags: ["Smart Cities", "IoT", "Urban Tech", "Infrastructure"],
    timeline: "42 months",
    next_milestone: "Secure additional $5M funding by Q3",
    recent_update: "ALERT: Behind schedule. Pilot traffic system shows promise but needs significant investment to scale.",
    image_url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop",
    created_at: "2024-03-12T00:00:00Z"
  },
  {
    id: "7",
    title: "African Renewable Energy Consortium",
    description: "Continental-scale renewable energy infrastructure development program targeting 10 GW of clean energy capacity across 12 countries.",
    impact_area: "cleantech",
    region: "central-africa",
    countries: ["Democratic Republic of Congo", "Cameroon", "Chad"],
    contribution_types: ["funding", "technical-skills", "operations"],
    skills_needed: ["Renewable Energy Engineering", "Project Finance", "Grid Integration", "Policy Development"],
    team_size: 85,
    collaborators: 72,
    funding_goal: 35000000, // $35M
    current_funding: 28000000, // $28M (80% funded)
    progress: 80,
    status: "scaling",
    urgency: "high",
    time_commitment: "full-time",
    creator: {
      name: "Dr. Jean-Baptiste Nkomo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80",
      title: "Renewable Energy Strategist"
    },
    tags: ["Renewable Energy", "Continental Infrastructure", "Climate Action", "Energy Security"],
    timeline: "60 months",
    next_milestone: "Complete Phase 1: 2 GW capacity",
    recent_update: "1.2 GW operational across 6 countries, regulatory approvals secured for Phase 2 expansion",
    image_url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&h=300&fit=crop",
    created_at: "2023-08-15T00:00:00Z"
  },
  {
    id: "8", 
    title: "African Women in Tech Accelerator - COMPLETED",
    description: "Comprehensive tech accelerator program that successfully supported 200+ women entrepreneurs to build and scale technology solutions. Major success story.",
    impact_area: "edtech",
    region: "north-africa",
    countries: ["Egypt", "Algeria", "Morocco"],
    contribution_types: ["mentorship", "funding", "network"],
    skills_needed: ["Startup Mentorship", "Tech Expertise", "Business Development", "Investment Strategy"],
    team_size: 30,
    collaborators: 28,
    funding_goal: 4500000, // $4.5M
    current_funding: 4500000, // $4.5M (100% funded - COMPLETED)
    progress: 100,
    status: "completed",
    urgency: "low",
    time_commitment: "flexible",
    creator: {
      name: "Fatima Al-Rashid",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=80",
      title: "Tech Entrepreneur"
    },
    tags: ["Women Empowerment", "Tech Acceleration", "Entrepreneurship", "Innovation"],
    timeline: "36 months", 
    next_milestone: "Program completed - Alumni network active",
    recent_update: "MAJOR SUCCESS: 200+ women entrepreneurs trained, $15M raised by alumni companies, 85% still operating.",
    image_url: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=500&h=300&fit=crop",
    created_at: "2023-02-01T00:00:00Z"
  },
  {
    id: "9",
    title: "Continental Trade Digital Platform",
    description: "Blockchain-powered trade facilitation platform enabling seamless cross-border commerce across African Continental Free Trade Area (AfCFTA).",
    impact_area: "fintech",
    region: "southern-africa",
    countries: ["South Africa", "Zimbabwe", "Botswana"],
    contribution_types: ["technical-skills", "business-expertise", "network"],
    skills_needed: ["Blockchain Development", "Trade Finance", "International Law", "System Integration"],
    team_size: 42,
    collaborators: 35,
    funding_goal: 22000000, // $22M
    current_funding: 17600000, // $17.6M (80% funded)
    progress: 80,
    status: "scaling",
    urgency: "medium",
    time_commitment: "full-time",
    creator: {
      name: "Nomsa Mthembu",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80",
      title: "Trade Technology Expert"
    },
    tags: ["AfCFTA", "Cross-border Trade", "Blockchain", "Economic Integration"],
    timeline: "48 months",
    next_milestone: "Launch in 10 additional countries",
    recent_update: "$2.5B in trade transactions processed, partnerships with 25+ financial institutions",
    image_url: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=500&h=300&fit=crop",
    created_at: "2024-01-10T00:00:00Z"
  },
  {
    id: "10",
    title: "AI-Powered Healthcare Diagnostics - UNDERPERFORMING",
    description: "Advanced AI diagnostic platform for early disease detection in rural areas. Struggling with technical challenges and regulatory hurdles.",
    impact_area: "healthtech",
    region: "west-africa",
    countries: ["Nigeria", "Mali"],
    contribution_types: ["technical-skills", "funding", "research"],
    skills_needed: ["AI/ML Development", "Medical Device Regulation", "Healthcare Operations", "Data Science"],
    team_size: 24,
    collaborators: 16,
    funding_goal: 9500000, // $9.5M
    current_funding: 2850000, // $2.85M (30% funded - UNDERPERFORMING)
    progress: 30,
    status: "active",
    urgency: "high",
    time_commitment: "full-time",
    creator: {
      name: "Dr. Amina Kone",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80",
      title: "AI Healthcare Researcher"
    },
    tags: ["AI Diagnostics", "Rural Healthcare", "Medical Technology", "Disease Prevention"],
    timeline: "36 months",
    next_milestone: "Complete regulatory approval process",
    recent_update: "CHALLENGES: Regulatory delays and technical setbacks. AI accuracy at 78%, needs improvement to 95%.",
    image_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=300&fit=crop",
    created_at: "2024-02-20T00:00:00Z"
  },
  ...extendedCollaborationProjects
];

// Dynamic stats calculation function
export const calculateStats = (projects: CollaborationProject[]): CollaborationStats => {
  const totalCollaborators = projects.reduce((sum, project) => sum + project.collaborators, 0);
  const uniqueCountries = new Set(projects.flatMap(project => project.countries));
  const totalFunding = projects.reduce((sum, project) => sum + (project.current_funding || 0), 0);
  
  return {
    total_projects: projects.length,
    active_collaborators: totalCollaborators,
    countries_involved: uniqueCountries.size,
    total_funding: `$${(totalFunding / 1000000).toFixed(1)}M`,
    impact_stories: Math.floor(projects.length * 0.6) // Assuming 60% have impact stories
  };
};

export const collaborationStats: CollaborationStats = calculateStats(enhancedCollaborationProjects);