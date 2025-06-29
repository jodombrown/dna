
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Eye, Users } from 'lucide-react';

interface AdminEventStatsProps {
  events: any[];
}

const AdminEventStats: React.FC<AdminEventStatsProps> = ({ events }) => {
  const upcomingEvents = events.filter(e => new Date(e.date_time) > new Date()).length;
  const featuredEvents = events.filter(e => e.is_featured).length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendee_count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          <Calendar className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{events.length}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Upcoming Events</CardTitle>
          <Clock className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEvents}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Featured Events</CardTitle>
          <Eye className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{featuredEvents}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Attendees</CardTitle>
          <Users className="w-4 h-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAttendees}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEventStats;
