
import { MapPin, Target, Users, Clock, DollarSign, AlertCircle } from 'lucide-react';
import React from 'react';

export const impactAreas = [
  { value: 'healthtech', label: 'HealthTech', icon: '🏥', description: 'Healthcare innovation' },
  { value: 'fintech', label: 'FinTech', icon: '💰', description: 'Financial services' },
  { value: 'agritech', label: 'AgriTech', icon: '🌾', description: 'Agricultural technology' },
  { value: 'edtech', label: 'EdTech', icon: '📚', description: 'Education technology' },
  { value: 'cleantech', label: 'CleanTech', icon: '🌱', description: 'Clean energy & environment' },
  { value: 'infrastructure', label: 'Infrastructure', icon: '🏗️', description: 'Physical & digital infrastructure' },
  { value: 'creative-economy', label: 'Creative Economy', icon: '🎨', description: 'Arts, culture & media' },
  { value: 'governance', label: 'Governance', icon: '🏛️', description: 'Public policy & civic tech' }
];

export const regions = [
  { value: 'west-africa', label: 'West Africa', flag: '🇬🇭' },
  { value: 'east-africa', label: 'East Africa', flag: '🇰🇪' },
  { value: 'north-africa', label: 'North Africa', flag: '🇪🇬' },
  { value: 'central-africa', label: 'Central Africa', flag: '🇨🇲' },
  { value: 'southern-africa', label: 'Southern Africa', flag: '🇿🇦' },
  { value: 'pan-african', label: 'Pan-African', flag: '🌍' }
];

export const contributionTypes = [
  { value: 'funding', label: 'Funding', icon: React.createElement(DollarSign, { className: "w-4 h-4" }), description: 'Financial investment' },
  { value: 'technical-skills', label: 'Technical Skills', icon: '⚙️', description: 'Development & engineering' },
  { value: 'business-expertise', label: 'Business Expertise', icon: '📊', description: 'Strategy & operations' },
  { value: 'mentorship', label: 'Mentorship', icon: '🤝', description: 'Guidance & advice' },
  { value: 'network', label: 'Network', icon: '🌐', description: 'Connections & partnerships' },
  { value: 'marketing', label: 'Marketing', icon: '📢', description: 'Promotion & outreach' },
  { value: 'operations', label: 'Operations', icon: '⚡', description: 'Day-to-day management' },
  { value: 'research', label: 'Research', icon: '🔬', description: 'Data & analysis' }
];

export const timeCommitments = [
  { value: 'flexible', label: 'Flexible', description: 'As needed basis' },
  { value: 'part-time', label: 'Part-time', description: '5-20 hours/week' },
  { value: 'full-time', label: 'Full-time', description: '40+ hours/week' }
];

export const urgencyLevels = [
  { value: 'high', label: 'High Priority', color: 'text-red-600', description: 'Urgent action needed' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', description: 'Important but flexible' },
  { value: 'low', label: 'Low Priority', color: 'text-green-600', description: 'Long-term opportunity' }
];

export const filterIcons = {
  Target,
  MapPin,
  Users,
  Clock,
  AlertCircle
};
