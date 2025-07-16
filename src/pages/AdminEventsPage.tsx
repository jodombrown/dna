
import React from 'react';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useRealtimeQuery } from '@/hooks/useRealtimeQuery';

const AdminEventsPage = () => {
  const { data: events, loading } = useRealtimeQuery('admin-events', {
    table: 'events',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'bg-blue-100 text-blue-800';
      case 'workshop':
        return 'bg-green-100 text-green-800';
      case 'networking':
        return 'bg-purple-100 text-purple-800';
      case 'webinar':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <AdminAuthWrapper>
        <AdminLayout>
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </AdminLayout>
      </AdminAuthWrapper>
    );
  }

  return (
    <AdminAuthWrapper>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Events Management</h1>
            <Button className="bg-dna-emerald hover:bg-dna-emerald/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search events..."
                    className="pl-4"
                  />
                </div>
                <Button variant="outline">
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events?.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getEventTypeColor(event.type || 'general')}>
                      {event.type || 'General'}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                  </div>
                  
                  <div className="space-y-2">
                    {event.date_time && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date_time).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{event.attendee_count || 0} attendees</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Created {new Date(event.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant={event.is_featured ? "default" : "secondary"}>
                      {event.is_featured ? 'Featured' : 'Standard'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {events?.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first event.</p>
                <Button className="bg-dna-emerald hover:bg-dna-emerald/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminAuthWrapper>
  );
};

export default AdminEventsPage;
