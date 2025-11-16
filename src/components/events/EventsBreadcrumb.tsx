import React from 'react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Event } from '@/types/search';

interface EventsBreadcrumbProps {
  selectedEvent?: Event | null;
  onClearSelection?: () => void;
}

/**
 * EventsBreadcrumb - Contextual breadcrumb navigation for CONVENE_MODE
 * 
 * States:
 * - Dashboard > Events (when browsing events)
 * - Dashboard > Events > [Event Name] (when viewing specific event)
 */
const EventsBreadcrumb: React.FC<EventsBreadcrumbProps> = ({ 
  selectedEvent,
  onClearSelection 
}) => {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Dashboard */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dna/feed">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {/* Events */}
        {selectedEvent ? (
          <BreadcrumbItem>
            <BreadcrumbLink 
              asChild
              className="cursor-pointer"
            >
              <span onClick={onClearSelection}>Events</span>
            </BreadcrumbLink>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage>Events</BreadcrumbPage>
          </BreadcrumbItem>
        )}
        
        {/* Selected Event Name */}
        {selectedEvent && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1 max-w-[200px]">
                {selectedEvent.title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default EventsBreadcrumb;
