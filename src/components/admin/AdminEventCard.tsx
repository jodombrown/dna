
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  type: string;
  attendee_count: number;
  max_attendees: number | null;
  is_featured: boolean;
  is_virtual: boolean;
  created_at: string;
  created_by: string;
  creator_profile?: {
    full_name: string;
    email: string;
  } | null;
}

interface AdminEventCardProps {
  event: Event;
  onEventAction: (eventId: string, action: 'feature' | 'unfeature' | 'delete' | 'edit', eventData?: Event) => void;
}

const AdminEventCard: React.FC<AdminEventCardProps> = ({ event, onEventAction }) => {
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.date_time);
    
    if (eventDate > now) return 'upcoming';
    return 'past';
  };

  const getStatusBadge = (event: Event) => {
    const status = getEventStatus(event);
    const colors = {
      upcoming: 'bg-green-100 text-green-800',
      past: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleFeatureToggle = () => {
    console.log('Feature toggle clicked for event:', event.id, 'Current featured status:', event.is_featured);
    onEventAction(event.id, event.is_featured ? 'unfeature' : 'feature');
  };

  const handleEdit = () => {
    console.log('Edit clicked for event:', event.id);
    onEventAction(event.id, 'edit', event);
  };

  const handleDelete = () => {
    console.log('Delete clicked for event:', event.id);
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      onEventAction(event.id, 'delete');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
              {getStatusBadge(event)}
              {event.is_featured && (
                <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
              )}
              {event.is_virtual && (
                <Badge className="bg-blue-100 text-blue-800">Virtual</Badge>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(event.date_time).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{event.location || 'Virtual'}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>
                  {event.attendee_count}
                  {event.max_attendees && ` / ${event.max_attendees}`} attendees
                </span>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              Created by {event.creator_profile?.full_name || 'Unknown'} • 
              {formatDistanceToNow(new Date(event.created_at))} ago
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFeatureToggle}
            >
              <Eye className="w-4 h-4 mr-1" />
              {event.is_featured ? 'Unfeature' : 'Feature'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminEventCard;
