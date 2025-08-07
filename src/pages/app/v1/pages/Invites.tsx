import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Archive, 
  AlertCircle, 
  UserPlus, 
  Mail,
  Calendar,
  Users,
  Link,
  Lock
} from 'lucide-react';

const Invites = () => {
  // Mock v1 invite data
  const legacyInvites = [
    {
      id: '1',
      email: 'sarah.johnson@example.com',
      status: 'pending',
      sentDate: '2024-01-15',
      expiresDate: '2024-02-15'
    },
    {
      id: '2',
      email: 'kwame.asante@example.com',
      status: 'accepted',
      sentDate: '2024-01-10',
      acceptedDate: '2024-01-12'
    },
    {
      id: '3',
      email: 'zara.okoye@example.com',
      status: 'expired',
      sentDate: '2023-12-20',
      expiresDate: '2024-01-20'
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800' },
      expired: { label: 'Expired', className: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Legacy Invites Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Invites System (v1)</CardTitle>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
              Read-Only Archive
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-700 text-sm mb-2">
                This is the archived v1 invites system. All invitation history is preserved but new invites cannot be sent.
              </p>
              <p className="text-amber-600 text-xs">
                Active invitation features are available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Sent</CardTitle>
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">247</div>
            <p className="text-xs text-gray-500 mt-1">v1 invitations</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Accepted</CardTitle>
              <UserPlus className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">189</div>
            <p className="text-xs text-gray-500 mt-1">successful joins</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">23</div>
            <p className="text-xs text-gray-500 mt-1">awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">76%</div>
            <p className="text-xs text-gray-500 mt-1">acceptance rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Disabled Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <span>Send Invitation (Archived)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  invitation.disabled@v1.archive
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invitation Type
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  Legacy System (Disabled)
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Message
              </label>
              <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500 min-h-[120px]">
                Invitation functionality is archived and disabled in v1. Please use the v2 platform for active invitations.
              </div>
            </div>

            <Button disabled className="bg-gray-300 text-gray-500">
              <Lock className="w-4 h-4 mr-2" />
              Send Invitation (Disabled)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legacy Invites History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Invitation History</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">v1 Archive</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {legacyInvites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>Sent: {new Date(invite.sentDate).toLocaleDateString()}</span>
                      {invite.status === 'accepted' && (
                        <span>Accepted: {new Date(invite.acceptedDate!).toLocaleDateString()}</span>
                      )}
                      {invite.status === 'pending' && (
                        <span>Expires: {new Date(invite.expiresDate!).toLocaleDateString()}</span>
                      )}
                      {invite.status === 'expired' && (
                        <span>Expired: {new Date(invite.expiresDate!).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getStatusBadge(invite.status)}
                  <Button variant="outline" size="sm" disabled className="text-gray-500">
                    <Link className="w-4 h-4 mr-2" />
                    Resend (Disabled)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>v1 Invitation Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Monthly Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">January 2024</span>
                  <span className="font-medium">47 sent, 36 accepted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">December 2023</span>
                  <span className="font-medium">52 sent, 41 accepted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">November 2023</span>
                  <span className="font-medium">38 sent, 29 accepted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">October 2023</span>
                  <span className="font-medium">43 sent, 32 accepted</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Top Referrers (v1)</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amara Okafor</span>
                  <span className="font-medium">23 successful invites</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kwame Asante</span>
                  <span className="font-medium">18 successful invites</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zara Okoye</span>
                  <span className="font-medium">15 successful invites</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Others</span>
                  <span className="font-medium">133 successful invites</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invites;