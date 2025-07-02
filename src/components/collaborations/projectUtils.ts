
export const getUrgencyColor = (urgency: string) => {
  switch (urgency) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-dna-emerald text-white';
    case 'launching': return 'bg-dna-copper text-white';
    case 'scaling': return 'bg-dna-gold text-white';
    case 'completed': return 'bg-gray-500 text-white';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const formatFunding = (amount: number) => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
};
