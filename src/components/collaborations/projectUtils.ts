
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'idea':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    case 'discovery':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'scoping':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'planning':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'active':
      return 'bg-dna-copper/20 text-dna-copper border-dna-copper/30';
    case 'testing':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'complete':
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'maintenance':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'high':
      return 'bg-red-50 text-red-600 border-red-200';
    case 'medium':
      return 'bg-yellow-50 text-yellow-600 border-yellow-200';
    case 'low':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

export const formatFunding = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
};

export const getStatusDisplayName = (status: string): string => {
  switch (status) {
    case 'idea':
      return 'Idea';
    case 'discovery':
      return 'Discovery';
    case 'scoping':
      return 'Scoping';
    case 'planning':
      return 'Planning';
    case 'approved':
      return 'Approved';
    case 'active':
      return 'Active';
    case 'testing':
      return 'Testing';
    case 'complete':
      return 'Complete';
    case 'maintenance':
      return 'Maintenance';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

export const projectStatuses = [
  { value: 'idea', label: 'Idea' },
  { value: 'discovery', label: 'Discovery' },
  { value: 'scoping', label: 'Scoping' },
  { value: 'planning', label: 'Planning' },
  { value: 'approved', label: 'Approved' },
  { value: 'active', label: 'Active' },
  { value: 'testing', label: 'Testing' },
  { value: 'complete', label: 'Complete' },
  { value: 'maintenance', label: 'Maintenance' }
];
