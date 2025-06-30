
import { MapPin, Target, Users, Clock, DollarSign, AlertCircle } from 'lucide-react';
import React from 'react';

export const impactAreas = [
  { value: 'healthtech', label: 'HealthTech', icon: '🏥', description: 'Healthcare innovation & digital health' },
  { value: 'fintech', label: 'FinTech', icon: '💰', description: 'Financial services & payments' },
  { value: 'agritech', label: 'AgriTech', icon: '🌾', description: 'Agricultural technology & farming' },
  { value: 'edtech', label: 'EdTech', icon: '📚', description: 'Education technology & learning' },
  { value: 'cleantech', label: 'CleanTech', icon: '🌱', description: 'Clean energy & sustainability' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', description: 'Physical & digital infrastructure' },
  { value: 'creative-economy', label: 'Creative Economy', icon: '🎨', description: 'Arts, culture & creative industries' },
  { value: 'governance', label: 'Governance', icon: '🏛️', description: 'Public policy & civic engagement' }
];

export const regions = [
  { value: 'west-africa', label: 'West Africa', flag: '🇬🇭', description: 'Ghana, Nigeria, Senegal, Mali, etc.' },
  { value: 'east-africa', label: 'East Africa', flag: '🇰🇪', description: 'Kenya, Tanzania, Uganda, Ethiopia, etc.' },
  { value: 'north-africa', label: 'North Africa', flag: '🇪🇬', description: 'Egypt, Morocco, Tunisia, Algeria, etc.' },
  { value: 'central-africa', label: 'Central Africa', flag: '🇨🇲', description: 'Cameroon, DRC, Chad, CAR, etc.' },
  { value: 'southern-africa', label: 'Southern Africa', flag: '🇿🇦', description: 'South Africa, Zimbabwe, Botswana, etc.' },
  { value: 'pan-african', label: 'Pan-African', flag: '🌍', description: 'Multi-regional or continent-wide initiatives' }
];

export const contributionTypes = [
  { value: 'funding', label: 'Financial Investment', icon: React.createElement(DollarSign, { className: "w-4 h-4" }), description: 'Provide capital or investment' },
  { value: 'technical-skills', label: 'Technical Expertise', icon: '⚙️', description: 'Development, engineering & tech skills' },
  { value: 'business-expertise', label: 'Business Strategy', icon: '📊', description: 'Strategy, operations & management' },
  { value: 'mentorship', label: 'Mentorship', icon: '🤝', description: 'Guidance, coaching & advisory support' },
  { value: 'network', label: 'Network Access', icon: '🌐', description: 'Connections, partnerships & introductions' },
  { value: 'marketing', label: 'Marketing Support', icon: '📢', description: 'Promotion, branding & outreach' },
  { value: 'operations', label: 'Operations', icon: '⚡', description: 'Day-to-day management & execution' },
  { value: 'research', label: 'Research & Analysis', icon: '🔬', description: 'Data analysis, market research & insights' }
];

export const timeCommitments = [
  { value: 'flexible', label: 'Flexible Schedule', icon: '🕰️', description: 'Contribute when available, project-based' },
  { value: 'part-time', label: 'Part-time Commitment', icon: '⏰', description: '5-20 hours per week, regular schedule' },
  { value: 'full-time', label: 'Full-time Engagement', icon: '🕐', description: '40+ hours per week, dedicated role' }
];

export const urgencyLevels = [
  { value: 'high', label: 'High Priority', icon: '🚨', color: 'text-red-600', description: 'Urgent action needed, immediate impact' },
  { value: 'medium', label: 'Medium Priority', icon: '⚠️', color: 'text-yellow-600', description: 'Important but flexible timeline' },
  { value: 'low', label: 'Low Priority', icon: '📅', color: 'text-green-600', description: 'Long-term opportunity, strategic focus' }
];

export const filterIcons = {
  Target,
  MapPin,
  Users,
  Clock,
  AlertCircle
};
