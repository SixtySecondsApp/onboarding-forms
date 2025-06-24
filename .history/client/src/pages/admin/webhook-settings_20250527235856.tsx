import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/theme-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  Webhook, 
  Copy, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Bell, 
  BarChart3, 
  FileText,
  Globe,
  Mail,
  Slack,
  MessageSquare,
  Shield,
  Key,
  Code,
  Activity,
  Clock,
  Users,
  Download,
  Filter,
  Search,
  ExternalLink,
  Zap,
  Database,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Info,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function WebhookSettings() {
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // State management
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  
  // Notification settings
  const [emailSettings, setEmailSettings] = useState({
    formCompletionAlerts: true,
    dailySummary: false,
    clientReminders: true,
    adminNotifications: true,
    webhookFailures: true,
    systemAlerts: true
  });
  
  const [slackSettings, setSlackSettings] = useState({
    enabled: false,
    webhookUrl: '',
    channel: '#general',
    formCompletions: true,
    systemAlerts: false
  });

  // Mock data for analytics and submissions
  const webhookStats = {
    totalDeliveries: 1247,
    successfulDeliveries: 1198,
    failedDeliveries: 49,
    averageResponseTime: 245,
    lastDelivery: new Date().toISOString()
  };

  const recentSubmissions = [
    {
      id: '1',
      clientName: 'Acme Corp',
      clientEmail: 'john@acme.com',
      status: 'completed',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      progress: 100
    },
    {
      id: '2',
      clientName: 'TechStart Inc',
      clientEmail: 'sarah@techstart.com',
      status: 'in_progress',
      submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      progress: 75
    },
    {
      id: '3',
      clientName: 'Global Solutions',
      clientEmail: 'mike@global.com',
      status: 'completed',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100
    }
  ];

  // Mutations
  const updateWebhookMutation = useMutation({
    mutationFn: async (data: { url: string; secret: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webhook settings updated",
        description: "Your webhook configuration has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error updating webhook",
        description: "Failed to save webhook settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Event handlers
  const handleSave = () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL required",
        description: "Please enter a valid webhook URL.",
        variant: "destructive",
      });
      return;
    }

    updateWebhookMutation.mutate({ url: webhookUrl, secret: webhookSecret });
  };

  const generateSecret = () => {
    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setWebhookSecret(secret);
    toast({
      title: "Secret generated",
      description: "A new webhook secret has been generated.",
    });
  };

  const testWebhook = async () => {
    setIsTestingWebhook(true);
    try {
      const response = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Webhook test successful",
          description: result.message || "Test webhook was sent successfully.",
        });
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      toast({
        title: "Webhook test failed",
        description: error instanceof Error ? error.message : "Failed to send test webhook.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
      setShowTestDialog(false);
    }
  };

  const testFormUpdatedWebhook = async () => {
    try {
      // Get the first form for testing
      const formsResponse = await fetch('/api/forms');
      const forms = await formsResponse.json();
      
      if (!forms || forms.length === 0) {
        toast({
          title: "No forms available",
          description: "Create a form first to test the form.updated webhook.",
          variant: "destructive",
        });
        return;
      }

      const testFormId = forms[0].id;
      const response = await fetch(`/api/webhook/test-form-updated/${testFormId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Form.updated webhook test successful",
          description: result.message || "Test form.updated webhook was sent successfully.",
        });
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      toast({
        title: "Form.updated webhook test failed",
        description: error instanceof Error ? error.message : "Failed to send test webhook.",
        variant: "destructive",
      });
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    toast({
      title: "Secret copied",
      description: "Webhook secret has been copied to clipboard.",
    });
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copied",
      description: "Webhook URL has been copied to clipboard.",
    });
  };

  const handleEmailToggle = (setting: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSlackToggle = (setting: keyof typeof slackSettings) => {
    setSlackSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const exportSubmissions = () => {
    // Simulate CSV export
    const csvContent = [
      ['Client Name', 'Email', 'Status', 'Progress', 'Submitted At'],
      ...recentSubmissions.map(sub => [
        sub.clientName,
        sub.clientEmail,
        sub.status,
        `${sub.progress}%`,
        new Date(sub.submittedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure webhooks, notifications, and system preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="webhooks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="w-4 h-4" />
              Submissions
            </TabsTrigger>
          </TabsList>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            {/* Webhook Configuration */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Webhook Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your webhook endpoint to receive real-time notifications when forms are completed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="webhook-url"
                        placeholder="https://your-app.com/webhooks/onboarding"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyWebhookUrl}
                        disabled={!webhookUrl}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook-secret">Webhook Secret</Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="webhook-secret"
                          type={showSecret ? "text" : "password"}
                          placeholder="Enter or generate a secret"
                          value={webhookSecret}
                          onChange={(e) => setWebhookSecret(e.target.value)}
                          className="pr-10"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copySecret}
                        disabled={!webhookSecret}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateSecret}
                        className="gap-2"
                      >
                        <Key className="w-4 h-4" />
                        Generate Secret
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={updateWebhookMutation.isPending}
                      className="gap-2"
                    >
                      {updateWebhookMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Save Configuration
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowTestDialog(true)}
                      disabled={!webhookUrl}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Test Webhook
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Documentation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Webhook Documentation
                  </CardTitle>
                  <CardDescription>
                    Learn how to handle webhook payloads in your application.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Payload Structure</h4>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} overflow-x-auto`}>
                      <pre className="text-sm">
                        <code>{`{
  "event": "form.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "formId": "uuid",
    "clientName": "Acme Corp",
    "clientEmail": "john@acme.com",
    "progress": 100,
    "submissionData": {
      "businessDetails": {...},
      "campaign": {...},
      "audience": {...}
    }
  }
}

// form.updated event
{
  "event": "form.updated",
  "form_id": 123,
  "new_data": {...},
  "old_data": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Security</h4>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
                      <div className="flex items-start gap-2">
                        <Shield className="w-4 h-4 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-700 dark:text-blue-300">Verify webhook signatures</p>
                          <p className="text-blue-600 dark:text-blue-400 mt-1">
                            Use the webhook secret to verify that requests are coming from our servers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Events</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm font-mono">form.completed</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={testWebhook}
                            disabled={!webhookUrl || isTestingWebhook}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm font-mono">form.updated</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Active</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={testFormUpdatedWebhook}
                            disabled={!webhookUrl}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded border">
                        <span className="text-sm font-mono">section.completed</span>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Webhook Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Webhook Statistics
                </CardTitle>
                <CardDescription>
                  Monitor your webhook delivery performance and reliability.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">Total Deliveries</span>
                    </div>
                    <p className="text-2xl font-bold">{webhookStats.totalDeliveries.toLocaleString()}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">Success Rate</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {Math.round((webhookStats.successfulDeliveries / webhookStats.totalDeliveries) * 100)}%
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium">Avg Response Time</span>
                    </div>
                    <p className="text-2xl font-bold">{webhookStats.averageResponseTime}ms</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">Failed Deliveries</span>
                    </div>
                    <p className="text-2xl font-bold">{webhookStats.failedDeliveries}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure which events trigger email notifications to your team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries({
                    formCompletionAlerts: {
                      label: "Form Completion Alerts",
                      description: "Receive an email when a client completes an onboarding form"
                    },
                    dailySummary: {
                      label: "Daily Summary",
                      description: "Receive a daily summary of all form activity"
                    },
                    clientReminders: {
                      label: "Client Reminder Notifications",
                      description: "Be notified when automatic reminders are sent to clients"
                    },
                    adminNotifications: {
                      label: "Admin Activity Notifications",
                      description: "Receive notifications about other admin activities"
                    },
                    webhookFailures: {
                      label: "Webhook Failure Alerts",
                      description: "Get notified when webhook deliveries fail"
                    },
                    systemAlerts: {
                      label: "System Alerts",
                      description: "Receive notifications about system maintenance and updates"
                    }
                  }).map(([key, config]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor={key}>{config.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      <Switch
                        id={key}
                        checked={emailSettings[key as keyof typeof emailSettings]}
                        onCheckedChange={() => handleEmailToggle(key as keyof typeof emailSettings)}
                      />
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Save Email Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Slack Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Slack className="w-5 h-5" />
                    Slack Integration
                  </CardTitle>
                  <CardDescription>
                    Send notifications directly to your Slack workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="slack-enabled">Enable Slack Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Turn on Slack integration for your workspace
                      </p>
                    </div>
                    <Switch
                      id="slack-enabled"
                      checked={slackSettings.enabled}
                      onCheckedChange={() => handleSlackToggle('enabled')}
                    />
                  </div>

                  {slackSettings.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                        <Input
                          id="slack-webhook"
                          placeholder="https://hooks.slack.com/services/..."
                          value={slackSettings.webhookUrl}
                          onChange={(e) => setSlackSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slack-channel">Default Channel</Label>
                        <Input
                          id="slack-channel"
                          placeholder="#general"
                          value={slackSettings.channel}
                          onChange={(e) => setSlackSettings(prev => ({ ...prev, channel: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="slack-completions">Form Completions</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify when forms are completed
                            </p>
                          </div>
                          <Switch
                            id="slack-completions"
                            checked={slackSettings.formCompletions}
                            onCheckedChange={() => handleSlackToggle('formCompletions')}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="slack-alerts">System Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                              Notify about system issues and maintenance
                            </p>
                          </div>
                          <Switch
                            id="slack-alerts"
                            checked={slackSettings.systemAlerts}
                            onCheckedChange={() => handleSlackToggle('systemAlerts')}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-4">
                    <Button className="gap-2" disabled={!slackSettings.enabled}>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Slack Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                      <p className="text-3xl font-bold mt-2">247</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        +12% from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                      <p className="text-3xl font-bold mt-2">87%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        +5% from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Avg. Time to Complete</p>
                      <p className="text-3xl font-bold mt-2">12m</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        -2m from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                      <p className="text-3xl font-bold mt-2">34</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        +8% from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Charts Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Form Completion Trends</CardTitle>
                <CardDescription>
                  Track form completion rates and user engagement over time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`h-64 rounded-lg border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'} flex items-center justify-center`}>
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Analytics charts coming soon</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Detailed analytics and reporting features will be available in the next update.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">
            {/* Submissions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Form Submissions</h2>
                <p className="text-muted-foreground">
                  View and manage all form submissions from your clients.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={exportSubmissions} className="gap-2">
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Submissions Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Client</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Progress</th>
                        <th className="text-left p-4 font-medium text-sm">Submitted</th>
                        <th className="text-right p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentSubmissions.map((submission) => (
                        <tr key={submission.id} className={`hover:${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} transition-colors`}>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{submission.clientName}</div>
                              <div className="text-sm text-muted-foreground">{submission.clientEmail}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge 
                              className={
                                submission.status === 'completed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-0'
                              }
                            >
                              {submission.status === 'completed' ? 'Completed' : 'In Progress'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                                  style={{ width: `${submission.progress}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">{submission.progress}%</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="sm" className="gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Test Webhook Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Webhook</DialogTitle>
            <DialogDescription>
              Send a test payload to your webhook endpoint to verify it's working correctly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <h4 className="font-medium mb-2">Test Payload</h4>
              <pre className="text-sm overflow-x-auto">
                <code>{`{
  "event": "webhook.test",
  "timestamp": "${new Date().toISOString()}",
  "data": {
    "message": "This is a test webhook"
  }
}`}</code>
              </pre>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={testWebhook} disabled={isTestingWebhook} className="gap-2">
              {isTestingWebhook ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isTestingWebhook ? 'Testing...' : 'Send Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 