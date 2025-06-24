import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  RefreshCw, Copy, Check, Save, AlertCircle, Info, 
  Webhook, Mail, Bell, Shield, Database, Globe,
  Eye, EyeOff, TestTube, Zap, Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme-context";
import type { Form } from "@/lib/supabase";

export default function WebhookSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [notifyOnSectionCompletion, setNotifyOnSectionCompletion] = useState(false);
  const [notifyOnFormCompletion, setNotifyOnFormCompletion] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [slackEnabled, setSlackEnabled] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("webhooks");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  // Fetch webhook settings
  const { data: webhookSettings, isLoading: webhookLoading } = useQuery({
    queryKey: ["webhook-settings"],
    queryFn: async () => {
      const response = await fetch(`/api/webhook-settings`);
      if (!response.ok) {
        throw new Error("Failed to fetch webhook settings");
      }
      return response.json();
    }
  });

  // Fetch all form submissions
  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      const response = await fetch(`/api/submissions`);
      if (!response.ok) {
        throw new Error("Failed to fetch form submissions");
      }
      return response.json();
    },
    enabled: activeTab === "submissions"
  });

  // Fetch system analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["system-analytics"],
    queryFn: async () => {
      const { data: forms } = await supabase
        .from('forms')
        .select('*');
      
      if (!forms) return null;
      
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        totalForms: forms.length,
        completedForms: forms.filter(f => f.status === 'completed').length,
        formsLast24h: forms.filter(f => new Date(f.created_at) > last24h).length,
        formsLast7d: forms.filter(f => new Date(f.created_at) > last7d).length,
        formsLast30d: forms.filter(f => new Date(f.created_at) > last30d).length,
        averageProgress: forms.length > 0 ? Math.round(forms.reduce((sum, f) => sum + f.progress, 0) / forms.length) : 0,
        completionRate: forms.length > 0 ? Math.round((forms.filter(f => f.status === 'completed').length / forms.length) * 100) : 0
      };
    },
    enabled: activeTab === "analytics"
  });

  // Update webhook settings mutation
  const updateWebhookMutation = useMutation({
    mutationFn: async (generateSecret = false) => {
      const url = generateSecret 
        ? `/api/webhook-settings?generateSecret=true` 
        : `/api/webhook-settings`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          webhookUrl,
          webhookEnabled,
          webhookSecret: generateSecret ? undefined : webhookSecret,
          notifyOnSectionCompletion,
          notifyOnFormCompletion,
          emailNotifications,
          slackWebhook,
          slackEnabled
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update webhook settings");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["webhook-settings"] });
      toast({
        title: "Settings saved",
        description: "Your webhook settings have been updated successfully",
      });
      
      // Update local state if a new secret was generated
      if (data.webhookSecret && data.webhookSecret !== webhookSecret) {
        setWebhookSecret(data.webhookSecret);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhookUrl,
          webhookSecret
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to test webhook');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Webhook test successful",
        description: "Your webhook endpoint received the test payload successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Webhook test failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Set initial values when data is loaded
  useEffect(() => {
    if (webhookSettings) {
      setWebhookUrl(webhookSettings.webhookUrl || "");
      setWebhookEnabled(webhookSettings.webhookEnabled || false);
      setWebhookSecret(webhookSettings.webhookSecret || "");
      setNotifyOnSectionCompletion(webhookSettings.notifyOnSectionCompletion || false);
      setNotifyOnFormCompletion(webhookSettings.notifyOnFormCompletion || true);
      setEmailNotifications(webhookSettings.emailNotifications ?? true);
      setSlackWebhook(webhookSettings.slackWebhook || "");
      setSlackEnabled(webhookSettings.slackEnabled || false);
    }
  }, [webhookSettings]);

  const handleSave = () => {
    updateWebhookMutation.mutate(false);
  };

  const handleGenerateSecret = () => {
    updateWebhookMutation.mutate(true);
  };

  const handleTestWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "Missing webhook URL",
        description: "Please enter a webhook URL before testing",
        variant: "destructive"
      });
      return;
    }
    testWebhookMutation.mutate();
  };

  const copySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Secret copied",
      description: "Webhook secret has been copied to clipboard",
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copied",
      description: "Webhook URL has been copied to clipboard",
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-gray-500 mt-1">
              Configure webhooks, notifications, and system preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateWebhookMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {updateWebhookMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="space-y-6">
            <div className="grid gap-6">
              {/* Webhook Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="w-5 h-5" />
                    Webhook Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure webhooks to receive real-time notifications when clients submit form data.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="webhookEnabled"
                      checked={webhookEnabled}
                      onCheckedChange={(checked) => setWebhookEnabled(checked)}
                    />
                    <Label htmlFor="webhookEnabled" className="font-medium">
                      Enable Webhooks
                    </Label>
                  </div>

                  {webhookEnabled && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <div className="flex gap-2">
                          <Input
                            id="webhookUrl"
                            placeholder="https://your-api.example.com/webhook"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copyWebhookUrl}
                            disabled={!webhookUrl}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          The URL that will receive webhook events when clients submit form data.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="webhookSecret">Webhook Secret</Label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              id="webhookSecret"
                              type={showSecret ? "text" : "password"}
                              value={webhookSecret}
                              onChange={(e) => setWebhookSecret(e.target.value)}
                              placeholder="Enter or generate a secret"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                              onClick={() => setShowSecret(!showSecret)}
                            >
                              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={copySecret}
                            disabled={!webhookSecret}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleGenerateSecret}
                            disabled={updateWebhookMutation.isPending}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500">
                          Used to verify webhook authenticity. Keep this secret secure.
                        </p>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={handleTestWebhook}
                          disabled={!webhookUrl || testWebhookMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          {testWebhookMutation.isPending ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          Test Webhook
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Webhook Events */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Webhook Events</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifyOnSectionCompletion"
                          checked={notifyOnSectionCompletion}
                          onCheckedChange={(checked) => setNotifyOnSectionCompletion(checked)}
                          disabled={!webhookEnabled}
                        />
                        <Label htmlFor="notifyOnSectionCompletion">
                          Section Completion
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">
                        Send webhook when a form section is completed
                      </p>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="notifyOnFormCompletion"
                          checked={notifyOnFormCompletion}
                          onCheckedChange={(checked) => setNotifyOnFormCompletion(checked)}
                          disabled={!webhookEnabled}
                        />
                        <Label htmlFor="notifyOnFormCompletion">
                          Form Completion
                        </Label>
                      </div>
                      <p className="text-sm text-gray-500 ml-7">
                        Send webhook when entire form is completed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Webhook Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Webhook Payload Structure</AlertTitle>
                    <AlertDescription>
                      Your webhook endpoint will receive POST requests with the following JSON structure:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
{`{
  "event": "form.completed" | "section.completed",
  "timestamp": "2024-01-01T12:00:00Z",
  "form": {
    "id": "form-id",
    "client_name": "Client Name",
    "client_email": "client@example.com",
    "progress": 100,
    "status": "completed",
    "data": { ... }
  },
  "section": { ... } // Only for section events
}`}
                    </pre>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Security</AlertTitle>
                    <AlertDescription>
                      Verify webhook authenticity by checking the <code>X-Webhook-Signature</code> header against your secret.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure email notifications for form events and reminders.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="emailNotifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                    <Label htmlFor="emailNotifications" className="font-medium">
                      Enable Email Notifications
                    </Label>
                  </div>
                  
                  {emailNotifications && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email notifications will be sent to the admin email address for:
                      </p>
                      <ul className="text-sm space-y-1 ml-4">
                        <li>• New form submissions</li>
                        <li>• Form completions</li>
                        <li>• Weekly progress reports</li>
                        <li>• System alerts</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Slack Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Slack Integration
                  </CardTitle>
                  <CardDescription>
                    Send notifications to your Slack workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="slackEnabled"
                      checked={slackEnabled}
                      onCheckedChange={setSlackEnabled}
                    />
                    <Label htmlFor="slackEnabled" className="font-medium">
                      Enable Slack Notifications
                    </Label>
                  </div>

                  {slackEnabled && (
                    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-2">
                        <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                        <Input
                          id="slackWebhook"
                          placeholder="https://hooks.slack.com/services/..."
                          value={slackWebhook}
                          onChange={(e) => setSlackWebhook(e.target.value)}
                        />
                        <p className="text-sm text-gray-500">
                          Create a webhook URL in your Slack workspace settings.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analyticsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : analytics ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalForms}</div>
                    <p className="text-xs text-muted-foreground">
                      All time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Completed Forms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.completedForms}</div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.completionRate}% completion rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageProgress}%</div>
                    <p className="text-xs text-muted-foreground">
                      Across all forms
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.formsLast24h}</div>
                    <p className="text-xs text-muted-foreground">
                      New forms created
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.formsLast7d}</div>
                    <p className="text-xs text-muted-foreground">
                      New forms created
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Last 30 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.formsLast30d}</div>
                    <p className="text-xs text-muted-foreground">
                      New forms created
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500">No analytics data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Form Submissions</CardTitle>
                <CardDescription>
                  View all form submissions and their current status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {submission.client_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{submission.client_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{submission.client_email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={submission.status === 'completed' ? 'default' : 'secondary'}>
                            {submission.status || 'pending'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : 'Unknown date'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 