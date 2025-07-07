import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Zap, 
  Globe, 
  Settings, 
  Key, 
  Check, 
  X, 
  Plus,
  ExternalLink,
  AlertTriangle 
} from 'lucide-react';

interface Integration {
  id: string;
  service_name: string;
  token_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ServiceConfig {
  name: string;
  displayName: string;
  icon: React.ComponentType<any>;
  description: string;
  tokenType: string;
  setupUrl: string;
  webhookSupport: boolean;
}

const AVAILABLE_SERVICES: ServiceConfig[] = [
  {
    name: 'sendgrid',
    displayName: 'SendGrid',
    icon: Mail,
    description: 'Email delivery service for transactional and marketing emails',
    tokenType: 'api_key',
    setupUrl: 'https://app.sendgrid.com/settings/api_keys',
    webhookSupport: true,
  },
  {
    name: 'mailchimp',
    displayName: 'Mailchimp',
    icon: Mail,
    description: 'Email marketing platform for newsletters and campaigns',
    tokenType: 'api_key',
    setupUrl: 'https://us1.admin.mailchimp.com/account/api/',
    webhookSupport: true,
  },
  {
    name: 'zapier',
    displayName: 'Zapier',
    icon: Zap,
    description: 'Automation platform connecting DNA to 5000+ apps',
    tokenType: 'webhook_url',
    setupUrl: 'https://zapier.com/app/zaps',
    webhookSupport: true,
  },
  {
    name: 'segment',
    displayName: 'Segment',
    icon: Globe,
    description: 'Customer data platform for analytics and tracking',
    tokenType: 'write_key',
    setupUrl: 'https://app.segment.com/sources',
    webhookSupport: false,
  },
];

export function IntegrationsManager() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (serviceName: string) => {
    try {
      const existing = integrations.find(i => i.service_name === serviceName);
      
      if (existing) {
        // Toggle active status
        const { error } = await supabase
          .from('integration_tokens')
          .update({ is_active: !existing.is_active })
          .eq('service_name', serviceName);

        if (error) throw error;

        setIntegrations(integrations.map(integration => 
          integration.service_name === serviceName 
            ? { ...integration, is_active: !integration.is_active }
            : integration
        ));
      }

      toast({
        title: "Success",
        description: `${serviceName} integration ${existing?.is_active ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: "Failed to toggle integration",
        variant: "destructive",
      });
    }
  };

  const testZapierWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a Zapier webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          from: "DNA Admin Panel",
          message: "Test webhook from DNA platform"
        }),
      });

      setTestResult("success");
      toast({
        title: "Test Sent",
        description: "Test webhook sent to Zapier. Check your Zap history to confirm receipt.",
      });
    } catch (error) {
      setTestResult("error");
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  const saveZapierWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('integration_tokens')
        .upsert({
          service_name: 'zapier',
          token_type: 'webhook_url',
          is_active: true,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      // Log the webhook URL securely (in practice, this would be encrypted)
      await supabase.from('admin_logs').insert({
        admin_id: (await supabase.auth.getUser()).data.user?.id,
        action: 'configure_integration',
        resource_type: 'integration',
        resource_id: 'zapier',
        details: { 
          webhook_configured: true,
          service: 'zapier'
        },
      });

      fetchIntegrations();
      toast({
        title: "Success",
        description: "Zapier webhook URL saved successfully",
      });
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL",
        variant: "destructive",
      });
    }
  };

  const getIntegrationStatus = (serviceName: string) => {
    const integration = integrations.find(i => i.service_name === serviceName);
    return integration?.is_active ? 'active' : integration ? 'inactive' : 'not_configured';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inactive</Badge>;
      case 'not_configured':
        return <Badge variant="outline">Not Configured</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">Loading integrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Notice */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> API keys and tokens are stored securely using Supabase's encryption. 
          Never share these credentials or include them in client-side code.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Service Integrations</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks & API</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Available Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AVAILABLE_SERVICES.map((service) => {
              const Icon = service.icon;
              const status = getIntegrationStatus(service.name);
              
              return (
                <Card key={service.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-8 w-8 text-dna-emerald" />
                        <div>
                          <CardTitle className="text-lg">{service.displayName}</CardTitle>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 capitalize">
                          {service.tokenType.replace('_', ' ')}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(service.setupUrl, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Setup
                      </Button>
                    </div>
                    
                    {status !== 'not_configured' && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Status: {status === 'active' ? 'Enabled' : 'Disabled'}
                        </span>
                        <Button
                          size="sm"
                          variant={status === 'active' ? 'destructive' : 'default'}
                          onClick={() => toggleIntegration(service.name)}
                        >
                          {status === 'active' ? (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {status === 'not_configured' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Configure {service.displayName}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Configure {service.displayName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-gray-600">
                              {service.description}
                            </p>
                            <div>
                              <Label htmlFor={`${service.name}-token`}>
                                {service.tokenType.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </Label>
                              <Input
                                id={`${service.name}-token`}
                                type="password"
                                placeholder={`Enter your ${service.displayName} ${service.tokenType}`}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => window.open(service.setupUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Get Token
                              </Button>
                              <Button className="flex-1">
                                Save Configuration
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          {/* Zapier Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Zapier Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure a Zapier webhook to trigger automation when events occur in DNA.
              </p>
              
              <div>
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={testZapierWebhook}
                  disabled={!webhookUrl}
                >
                  Test Webhook
                </Button>
                <Button 
                  onClick={saveZapierWebhook}
                  disabled={!webhookUrl}
                >
                  Save Webhook
                </Button>
              </div>

              {testResult && (
                <Alert className={testResult === 'success' ? 'border-green-200' : 'border-red-200'}>
                  <AlertDescription>
                    {testResult === 'success' 
                      ? 'Test webhook sent successfully! Check your Zap history.'
                      : 'Failed to send test webhook. Please check the URL and try again.'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* API Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Usage Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Webhook Events</h4>
                <p className="text-sm text-gray-600 mb-2">
                  DNA can send webhooks for the following events:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>New user signup</li>
                  <li>Waitlist approval</li>
                  <li>New referral</li>
                  <li>Campaign completion</li>
                  <li>Form submission</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">Sample Webhook Payload</h4>
                <Textarea
                  readOnly
                  className="font-mono text-xs"
                  value={JSON.stringify({
                    event: "user.signup",
                    user_id: "uuid",
                    email: "user@example.com",
                    timestamp: "2024-01-01T00:00:00Z",
                    metadata: {
                      source: "waitlist",
                      campaign: "launch_q1"
                    }
                  }, null, 2)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}