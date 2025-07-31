import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchEvents } from '@/services/eventsService';
import { Event } from '@/types/search';

export const useLiveEvents = (filters: any = {}) => {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: () => searchEvents('', { upcoming_only: true, ...filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => searchEvents('', { upcoming_only: true }),
    staleTime: 5 * 60 * 1000,
  });
};