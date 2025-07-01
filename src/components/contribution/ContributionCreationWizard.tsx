
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft, 
  DollarSign, 
  BookOpen, 
  Clock, 
  Users, 
  Megaphone, 
  Gift,
  Upload,
  CheckCircle
} from 'lucide-react';

interface ContributionCreationWizardProps {
  onContributionCreated: () => void;
}

const ContributionCreationWizard: React.FC<ContributionCreationWizardProps> = ({
  onContributionCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    pathway: '',
    title: '',
    description: '',
    impactArea: '',
    location: '',
    targetAmount: '',
    timeline: '',
    skills: [],
    tags: []
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const pathways = [
    { id: 'funding', label: 'Financial Investment', icon: DollarSign, color: 'text-green-600' },
    { id: 'skills', label: 'Skills & Expertise', icon: BookOpen, color: 'text-blue-600' },
    { id: 'time', label: 'Time & Volunteering', icon: Clock, color: 'text-purple-600' },
    { id: 'network', label: 'Network & Connections', icon: Users, color: 'text-orange-600' },
    { id: 'advocacy', label: 'Advocacy & Awareness', icon: Megaphone, color: 'text-red-600' },
    { id: 'resources', label: 'In-Kind Resources', icon: Gift, color: 'text-indigo-600' }
  ];

  const impactAreas = [
    'Education', 'Healthcare', 'Technology', 'Agriculture', 'Finance', 
    'Clean Energy', 'Infrastructure', 'Arts & Culture', 'Women Empowerment', 'Youth Development'
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // In a real app, this would submit to backend
    onContributionCreated();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Choose Your Contribution Pathway</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {pathways.map((pathway) => (
            <div
              key={pathway.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                formData.pathway === pathway.id
                  ? 'border-dna-emerald bg-dna-emerald/10'
                  : 'border-gray-200 hover:border-dna-emerald/50'
              }`}
              onClick={() => setFormData({ ...formData, pathway: pathway.id })}
            >
              <div className="flex items-center gap-3">
                <pathway.icon className={`w-6 h-6 ${pathway.color}`} />
                <span className="font-medium">{pathway.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Project Details</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter your project title"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your contribution and its expected impact"
              rows={4}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="impactArea">Impact Area</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, impactArea: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select impact area" />
                </SelectTrigger>
                <SelectContent>
                  {impactAreas.map((area) => (
                    <SelectItem key={area} value={area.toLowerCase()}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Country or region"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Contribution Specifics</h3>
        <div className="space-y-4">
          {formData.pathway === 'funding' && (
            <div>
              <Label htmlFor="targetAmount">Target Amount (USD)</Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="Enter target funding amount"
              />
            </div>
          )}
          <div>
            <Label htmlFor="timeline">Timeline</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, timeline: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-month">1 Month</SelectItem>
                <SelectItem value="3-months">3 Months</SelectItem>
                <SelectItem value="6-months">6 Months</SelectItem>
                <SelectItem value="1-year">1 Year</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Supporting Documents (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload project documents, images, or presentations</p>
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-dna-emerald mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-4">Review Your Contribution</h3>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4 text-left">
              <div>
                <span className="font-medium">Pathway:</span>
                <Badge className="ml-2 bg-dna-emerald">
                  {pathways.find(p => p.id === formData.pathway)?.label}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Title:</span>
                <span className="ml-2">{formData.title}</span>
              </div>
              <div>
                <span className="font-medium">Impact Area:</span>
                <span className="ml-2">{formData.impactArea}</span>
              </div>
              <div>
                <span className="font-medium">Location:</span>
                <span className="ml-2">{formData.location}</span>
              </div>
              <div>
                <span className="font-medium">Timeline:</span>
                <span className="ml-2">{formData.timeline}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create Contribution</h2>
          <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!formData.pathway && currentStep === 1}
                className="bg-dna-emerald hover:bg-dna-forest"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-dna-emerald hover:bg-dna-forest"
              >
                Create Contribution
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributionCreationWizard;
