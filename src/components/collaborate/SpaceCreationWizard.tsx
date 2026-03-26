import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  ResponsiveModal, 
  ResponsiveModalHeader, 
  ResponsiveModalTitle 
} from '@/components/ui/responsive-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  GraduationCap, 
  TrendingUp, 
  Calendar, 
  BookOpen, 
  Megaphone,
  Users,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useSpaceTemplates, useCreateSpaceFromTemplate, useCreateSpace } from '@/hooks/useCollaborate';
import type { SpaceTemplate, PrivacyLevel } from '@/types/collaborate';
import { cn } from '@/lib/utils';

interface SpaceCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceType?: 'event' | 'content' | 'marketplace' | 'organic';
  sourceId?: string;
}

type WizardStep = 'template' | 'details' | 'privacy' | 'review';

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'graduation-cap': GraduationCap,
  'trending-up': TrendingUp,
  'calendar': Calendar,
  'book-open': BookOpen,
  'megaphone': Megaphone,
  'users': Users,
};

const CATEGORY_COLORS: Record<string, string> = {
  learning: 'border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20',
  investment: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
  community: 'border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20',
  advocacy: 'border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20',
  professional: 'border-muted bg-muted/50',
};

export function SpaceCreationWizard({ 
  open, 
  onOpenChange,
  sourceType,
  sourceId 
}: SpaceCreationWizardProps) {
  const navigate = useNavigate();
  const { data: templates, isLoading: templatesLoading } = useSpaceTemplates();
  const createFromTemplate = useCreateSpaceFromTemplate();
  const createSpace = useCreateSpace();

  const [step, setStep] = useState<WizardStep>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<SpaceTemplate | null>(null);
  const [useTemplate, setUseTemplate] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    privacy_level: 'public' as PrivacyLevel,
  });

  const handleNext = () => {
    const steps: WizardStep[] = ['template', 'details', 'privacy', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: WizardStep[] = ['template', 'details', 'privacy', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleCreate = async () => {
    try {
      let space;
      if (useTemplate && selectedTemplate) {
        space = await createFromTemplate.mutateAsync({
          templateId: selectedTemplate.id,
          input: {
            name: formData.name,
            description: formData.description,
            privacy_level: formData.privacy_level,
            source_type: sourceType,
            source_id: sourceId,
          },
        });
      } else {
        space = await createSpace.mutateAsync({
          name: formData.name,
          description: formData.description,
          privacy_level: formData.privacy_level,
          source_type: sourceType,
          source_id: sourceId,
        });
      }
      onOpenChange(false);
      if (space?.slug) {
        navigate(`/dna/collaborate/spaces/${space.slug}`);
      } else {
        navigate(`/dna/collaborate`);
      }
    } catch (error) {
      toast.error('Failed to create space. Please try again.');
    }
  };

  const isCreating = createFromTemplate.isPending || createSpace.isPending;

  const canProceed = () => {
    switch (step) {
      case 'template':
        return useTemplate ? !!selectedTemplate : true;
      case 'details':
        return formData.name.trim().length >= 3;
      case 'privacy':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} className="max-w-xl">
        <div className="overflow-y-auto max-h-[80dvh] p-4 sm:p-6">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>
            {step === 'template' && 'Choose a Template'}
            {step === 'details' && 'Space Details'}
            {step === 'privacy' && 'Privacy Settings'}
            {step === 'review' && 'Review & Create'}
          </ResponsiveModalTitle>
        </ResponsiveModalHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {(['template', 'details', 'privacy', 'review'] as WizardStep[]).map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step === s
                    ? 'bg-primary text-primary-foreground'
                    : ['template', 'details', 'privacy', 'review'].indexOf(step) > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {i + 1}
              </div>
              {i < 3 && (
                <div
                  className={cn(
                    'w-8 h-0.5 mx-1',
                    ['template', 'details', 'privacy', 'review'].indexOf(step) > i
                      ? 'bg-primary'
                      : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* TEMPLATE STEP */}
          {step === 'template' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={useTemplate ? 'default' : 'outline'}
                  onClick={() => setUseTemplate(true)}
                >
                  Use Template
                </Button>
                <Button
                  variant={!useTemplate ? 'default' : 'outline'}
                  onClick={() => setUseTemplate(false)}
                >
                  Start from Scratch
                </Button>
              </div>

              {useTemplate && (
                <div className="grid gap-3">
                  {templatesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    templates?.map((template) => {
                      const Icon = TEMPLATE_ICONS[template.icon] || Users;
                      return (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template)}
                          className={cn(
                            'flex items-start gap-4 p-4 rounded-lg border-2 text-left transition-all',
                            selectedTemplate?.id === template.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50',
                            CATEGORY_COLORS[template.category]
                          )}
                        >
                          <div className="p-2 rounded-lg bg-background shadow-sm">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                            <div className="flex gap-2 mt-2 text-xs">
                              <span className="px-2 py-0.5 bg-muted rounded-full">
                                {template.default_roles?.length || 0} roles
                              </span>
                              <span className="px-2 py-0.5 bg-muted rounded-full">
                                {template.category}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}

              {!useTemplate && (
                <div className="p-8 text-center border-2 border-dashed rounded-lg">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You'll create a blank space and add roles manually.</p>
                </div>
              )}
            </div>
          )}

          {/* DETAILS STEP */}
          {step === 'details' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="space-name">Space Name *</Label>
                <Input
                  id="space-name"
                  placeholder="e.g., Nigeria Investment Syndicate"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="space-description">Description</Label>
                <Textarea
                  id="space-description"
                  placeholder="What is this space about? What will members accomplish together?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              {selectedTemplate && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Using template: <strong className="text-foreground">{selectedTemplate.name}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedTemplate.default_roles?.length || 0} pre-configured roles will be created
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PRIVACY STEP */}
          {step === 'privacy' && (
            <div className="space-y-4">
              <RadioGroup
                value={formData.privacy_level}
                onValueChange={(value) => 
                  setFormData({ ...formData, privacy_level: value as PrivacyLevel })
                }
              >
                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.privacy_level === 'public'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="public" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-medium">Public</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Anyone on DNA can discover and request to join this space.
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.privacy_level === 'private'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="private" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-primary" />
                      <span className="font-medium">Private</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only invited members can see and join. Hidden from discovery.
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                    formData.privacy_level === 'invite_only'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <RadioGroupItem value="invite_only" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <span className="font-medium">Invite Only</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visible in discovery but requires invitation to join.
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>
          )}

          {/* REVIEW STEP */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Name</span>
                  <p className="font-medium">{formData.name}</p>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-sm text-muted-foreground">Description</span>
                    <p className="text-sm">{formData.description}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-muted-foreground">Privacy</span>
                  <p className="font-medium capitalize">{formData.privacy_level.replace('_', ' ')}</p>
                </div>
                {selectedTemplate && (
                  <div>
                    <span className="text-sm text-muted-foreground">Template</span>
                    <p className="font-medium">{selectedTemplate.name}</p>
                  </div>
                )}
              </div>

              {selectedTemplate && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Roles that will be created:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.default_roles?.map((role, i) => (
                      <span
                        key={i}
                        className={cn(
                          'text-xs px-2 py-1 rounded-full',
                          role.is_lead
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {role.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 'template'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step === 'review' ? (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Space'
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
        </div>
    </ResponsiveModal>
  );
}
