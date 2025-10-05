import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const VerifyOrganization = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    annual_budget_usd: '',
    website_url: '',
    social_media_links: '',
    description_of_work: '',
    reference_1_name: '',
    reference_1_email: '',
    reference_1_relationship: '',
    reference_2_name: '',
    reference_2_email: '',
    reference_2_relationship: '',
  });

  // Fetch organization
  const { data: organization } = useQuery({
    queryKey: ['organization', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Check if already verified or pending
  const { data: existingRequest } = useQuery({
    queryKey: ['verification-request', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;
      const { data, error } = await supabase
        .from('organization_verification_requests')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!organization?.id) throw new Error('Organization not found');

      // Create verification request
      const { error } = await supabase
        .from('organization_verification_requests')
        .insert({
          organization_id: organization.id,
          annual_budget_usd: parseInt(formData.annual_budget_usd) || null,
          website_url: formData.website_url,
          social_media_links: formData.social_media_links.split(',').map(s => s.trim()),
          description_of_work: formData.description_of_work,
          reference_1_name: formData.reference_1_name,
          reference_1_email: formData.reference_1_email,
          reference_1_relationship: formData.reference_1_relationship,
          reference_2_name: formData.reference_2_name,
          reference_2_email: formData.reference_2_email,
          reference_2_relationship: formData.reference_2_relationship,
        });

      if (error) throw error;

      // Update org status
      await supabase
        .from('organizations')
        .update({
          verification_status: 'pending',
          verification_submitted_at: new Date().toISOString(),
        })
        .eq('id', organization.id);
    },
    onSuccess: () => {
      toast({
        title: 'Verification submitted!',
        description: 'We\'ll review your request within 5 business days.',
      });
      queryClient.invalidateQueries({ queryKey: ['organization', slug] });
      queryClient.invalidateQueries({ queryKey: ['verification-request'] });
      navigate(`/org/${slug}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Submission failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Show status if already submitted
  if (organization?.verification_status === 'approved') {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Organization Verified</strong>
            <p className="mt-2">Your organization has been approved and can now post opportunities.</p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(`/org/${slug}`)} className="mt-4">
          Back to Organization
        </Button>
      </div>
    );
  }

  if (organization?.verification_status === 'pending' || existingRequest?.status === 'pending') {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Verification Pending</strong>
            <p className="mt-2">Your verification request is under review. We'll notify you within 5 business days.</p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(`/org/${slug}`)} className="mt-4">
          Back to Organization
        </Button>
      </div>
    );
  }

  if (organization?.verification_status === 'rejected') {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Verification Rejected</strong>
            <p className="mt-2">{organization.verification_notes || 'Your verification request was not approved.'}</p>
            <p className="mt-2">Please contact support or resubmit with updated information.</p>
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate(`/org/${slug}`)} className="mt-4">
          Back to Organization
        </Button>
      </div>
    );
  }

  const canSubmit = 
    formData.website_url &&
    formData.description_of_work &&
    formData.reference_1_name &&
    formData.reference_1_email &&
    formData.reference_2_name &&
    formData.reference_2_email;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Verify Your Organization</h1>
        <p className="text-muted-foreground mt-2">
          Complete verification to post opportunities on DNA Platform. One-time $199 verification fee applies.
        </p>
      </div>

      <div className="space-y-6">
        {/* What You'll Need */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Need</CardTitle>
            <CardDescription>Prepare these documents before starting</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>Official registration document (NGO certificate, business license, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>Proof of activity (website, annual report, recent social media)</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>Financial transparency document (budget summary or financial statement)</span>
              </li>
              <li className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <span>Two professional references (board members, partners, or collaborators)</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Organization Info */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Annual Budget (USD)</Label>
              <Input
                type="number"
                value={formData.annual_budget_usd}
                onChange={(e) => setFormData({ ...formData, annual_budget_usd: e.target.value })}
                placeholder="e.g., 500000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Determines your subscription tier (under $250K = free monthly)
              </p>
            </div>

            <div>
              <Label>Official Website *</Label>
              <Input
                value={formData.website_url}
                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                placeholder="https://yourorganization.org"
              />
            </div>

            <div>
              <Label>Social Media Links</Label>
              <Input
                value={formData.social_media_links}
                onChange={(e) => setFormData({ ...formData, social_media_links: e.target.value })}
                placeholder="LinkedIn, Twitter, Facebook URLs (comma-separated)"
              />
            </div>

            <div>
              <Label>Description of Work *</Label>
              <Textarea
                value={formData.description_of_work}
                onChange={(e) => setFormData({ ...formData, description_of_work: e.target.value })}
                placeholder="Tell us about your organization's mission, recent projects, and impact..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <CardTitle>Professional References</CardTitle>
            <CardDescription>Provide two references who can verify your organization's legitimacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium">Reference 1 *</h4>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.reference_1_name}
                  onChange={(e) => setFormData({ ...formData, reference_1_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.reference_1_email}
                  onChange={(e) => setFormData({ ...formData, reference_1_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Relationship to Organization</Label>
                <Input
                  value={formData.reference_1_relationship}
                  onChange={(e) => setFormData({ ...formData, reference_1_relationship: e.target.value })}
                  placeholder="e.g., Board Member, Partner Organization Director"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Reference 2 *</h4>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={formData.reference_2_name}
                  onChange={(e) => setFormData({ ...formData, reference_2_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.reference_2_email}
                  onChange={(e) => setFormData({ ...formData, reference_2_email: e.target.value })}
                />
              </div>
              <div>
                <Label>Relationship to Organization</Label>
                <Input
                  value={formData.reference_2_relationship}
                  onChange={(e) => setFormData({ ...formData, reference_2_relationship: e.target.value })}
                  placeholder="e.g., Founding Member, Project Collaborator"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Upload Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload will be enabled after initial submission. For now, email documents to verify@diasporanetwork.africa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Document upload coming soon</p>
              <p className="text-xs mt-1">We'll contact you for documents after submission</p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Fee: $199 USD</CardTitle>
            <CardDescription>
              One-time fee covers document review and quality assurance. Payment link will be sent after submission.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => submitMutation.mutate()}
              disabled={!canSubmit || submitMutation.isPending}
              className="w-full"
              size="lg"
            >
              {submitMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-3">
              By submitting, you agree to our verification terms. Review typically takes 3-5 business days.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOrganization;
