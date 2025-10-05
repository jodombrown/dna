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
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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

  const canSubmit = 
    formData.website_url &&
    formData.description_of_work &&
    formData.reference_1_name &&
    formData.reference_1_email &&
    formData.reference_2_name &&
    formData.reference_2_email;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/org/${slug}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Verify Your Organization</h1>
        <p className="text-muted-foreground mt-2">
          Complete verification to post opportunities on DNA Platform. One-time $199 verification fee applies.
        </p>
      </div>

      <div className="space-y-6">
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
              <Label>Description of Work *</Label>
              <Textarea
                value={formData.description_of_work}
                onChange={(e) => setFormData({ ...formData, description_of_work: e.target.value })}
                placeholder="Tell us about your organization's mission..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Fee: $199 USD</CardTitle>
            <CardDescription>
              One-time fee covers document review. Coming soon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              disabled={!canSubmit}
              className="w-full"
              size="lg"
            >
              Submit for Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyOrganization;
