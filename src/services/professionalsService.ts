
import { Professional } from '@/types/search';

// Since the professionals table was removed, return empty array for now
export const searchProfessionals = async (searchTerm: string = '', filters: any = {}): Promise<Professional[]> => {
  // Placeholder implementation - returns empty array since table is removed
  console.log('Professional search placeholder', { searchTerm, filters });
  return [];
};
