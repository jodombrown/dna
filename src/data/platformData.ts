
export const platformData = {
  platform_layers: [
    {
      layer: "User Interface Layer",
      components: ["Web App (React/Angular)", "Mobile Apps (React Native)", "Admin Dashboard", "API Gateway"]
    },
    {
      layer: "Community Layer",
      components: ["User Profiles", "Groups & Forums", "Events", "Mentorship", "Resource Library"]
    },
    {
      layer: "Investment Layer",
      components: ["Project Marketplace", "Due Diligence Tools", "Portfolio Management", "ROI Tracking", "Payment Processing"]
    },
    {
      layer: "Data Layer",
      components: ["User Database", "Project Database", "Transaction Records", "Analytics", "Security & Compliance"]
    }
  ],
  user_journey: [
    {
      stage: "Onboarding",
      actions: ["Registration", "Profile Creation", "Pathway Selection", "Community Matching"],
      count: 5
    },
    {
      stage: "Engagement",
      actions: ["Network Building", "Join Groups", "Attend Events", "Access Resources"],
      count: 8
    },
    {
      stage: "Discovery",
      actions: ["Browse Projects", "Review Details", "Conduct Due Diligence", "Connect with Founders"],
      count: 6
    },
    {
      stage: "Investment",
      actions: ["Make Investment", "Track Progress", "Receive Updates", "Monitor ROI"],
      count: 4
    },
    {
      stage: "Collaboration",
      actions: ["Provide Expertise", "Mentor Others", "Share Knowledge", "Scale Impact"],
      count: 7
    }
  ],
  revenue_streams: [
    { stream: "Membership Fees", monthly_revenue: 25000, percentage: 35 },
    { stream: "Transaction Fees", monthly_revenue: 18000, percentage: 25 },
    { stream: "Educational Services", monthly_revenue: 14000, percentage: 20 },
    { stream: "Partnership Revenue", monthly_revenue: 10000, percentage: 14 },
    { stream: "Premium Features", monthly_revenue: 4000, percentage: 6 }
  ],
  target_metrics: [
    { metric: "Active Users", target: 50000, current: 35000, timeframe: "Year 1" },
    { metric: "Projects Funded", target: 500, current: 320, timeframe: "Year 1" },
    { metric: "Capital Raised ($M)", target: 25, current: 18.5, timeframe: "Year 1" },
    { metric: "ROI Average (%)", target: 15, current: 12.8, timeframe: "Year 1" },
    { metric: "User Retention (%)", target: 75, current: 68, timeframe: "Monthly" }
  ]
};
