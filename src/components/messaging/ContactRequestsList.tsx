
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useContactRequests, ContactRequest } from '@/hooks/useContactRequests';
import { format } from 'date-fns';
import { Users, Handshake, Check, X, Clock, User } from 'lucide-react';

interface ContactRequestsListProps {
  type: 'sent' | 'received';
}

const ContactRequestsList: React.FC<ContactRequestsListProps> = ({ type }) => {
  const { sentRequests, receivedRequests, respondToRequest } = useContactRequests();
  
  const requests = type === 'sent' ? sentRequests : receivedRequests;
  const isReceived = type === 'received';

  const handleRespond = async (requestId: string, status: 'accepted' | 'declined') => {
    await respondToRequest(requestId, status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'declined': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPurposeIcon = (purpose: string) => {
    return purpose === 'connect' ? Users : Handshake;
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No {type} requests yet
        </h3>
        <p className="text-gray-600">
          {isReceived 
            ? 'When people want to connect with you, their requests will appear here.' 
            : 'Start connecting with diaspora professionals to see your sent requests here.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const profile = isReceived ? request.sender_profile : request.receiver_profile;
        const PurposeIcon = getPurposeIcon(request.purpose);
        
        return (
          <Card key={request.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>
                    <User className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {profile?.full_name || 'Professional'}
                    </h4>
                    <PurposeIcon className="w-4 h-4 text-gray-500" />
                    <Badge variant="outline" className="text-xs">
                      {request.purpose}
                    </Badge>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                    <span className="text-xs text-gray-500 capitalize">
                      {request.status}
                    </span>
                  </div>
                  
                  {profile?.profession && (
                    <p className="text-sm text-gray-600 mb-2">{profile.profession}</p>
                  )}
                  
                  {request.message && (
                    <p className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded-lg">
                      "{request.message}"
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {format(new Date(request.created_at), 'MMM d, yyyy')}
                    </span>
                    
                    {isReceived && request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRespond(request.id, 'declined')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRespond(request.id, 'accepted')}
                          className="bg-dna-emerald hover:bg-dna-forest text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ContactRequestsList;
