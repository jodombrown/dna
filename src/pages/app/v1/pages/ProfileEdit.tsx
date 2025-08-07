import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfileEdit = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Legacy Profile Edit Header */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Archive className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-amber-800">Legacy Profile Editor (v1)</CardTitle>
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
                Profile editing is disabled in the v1 archive. All data is preserved for historical reference.
              </p>
              <p className="text-amber-600 text-xs">
                Active profile editing is available in the v2 platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disabled Edit Interface */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-gray-400" />
              <span>Edit Profile (Archived)</span>
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => navigate('/app/v1/profile')}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Role
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    [Preserved v1 Data]
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500 min-h-[120px]">
                [Preserved v1 Bio Content]
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                    v1 Skill 1
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                    v1 Skill 2
                  </Badge>
                  <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                    v1 Skill 3
                  </Badge>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  [Preserved v1 LinkedIn]
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                  [Preserved v1 Website]
                </div>
              </div>
            </div>

            {/* Disabled Actions */}
            <div className="flex space-x-4 pt-6">
              <Button disabled className="bg-gray-300 text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                Save Changes (Disabled)
              </Button>
              <Button 
                variant="outline" 
                disabled 
                className="text-gray-500 border-gray-300"
              >
                Cancel (Disabled)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Archive Notice */}
      <Card className="border-gray-200 bg-gray-50">
        <CardContent className="p-6">
          <div className="text-center">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Data Preserved</h3>
            <p className="text-gray-600 mb-4">
              All your v1 profile information has been preserved and archived. 
              While editing is disabled in this legacy view, your data remains intact.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Complete profile history maintained</p>
              <p>• All connections and relationships preserved</p>
              <p>• Skills, experience, and achievements archived</p>
              <p>• Social links and contact information saved</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEdit;