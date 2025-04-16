import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RefreshCw, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Form } from "@/lib/supabase";

export default function WebhookSettings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [notifyOnSectionCompletion, setNotifyOnSectionCompletion] = useState(false);
  const [notifyOnFormCompletion, setNotifyOnFormCompletion] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

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
          notifyOnFormCompletion
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
        title: "Success",
        description: "Webhook settings updated successfully",
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

  // Set initial values when data is loaded
  useEffect(() => {
    if (webhookSettings) {
      setWebhookUrl(webhookSettings.webhookUrl || "");
      setWebhookEnabled(webhookSettings.webhookEnabled || false);
      setWebhookSecret(webhookSettings.webhookSecret || "");
      setNotifyOnSectionCompletion(webhookSettings.notifyOnSectionCompletion || false);
      setNotifyOnFormCompletion(webhookSettings.notifyOnFormCompletion || true);
    }
  }, [webhookSettings]);

  const handleSave = () => {
    updateWebhookMutation.mutate(false);
  };

  const handleGenerateSecret = () => {
    updateWebhookMutation.mutate(true);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            System Webhook Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Configure global webhook settings for all forms
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">
              Webhook Settings
            </TabsTrigger>
            <TabsTrigger value="submissions">
              All Form Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Global Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure a webhook to receive real-time notifications when clients submit data to any form in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">Webhook URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://your-api.example.com/webhook"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    The URL that will receive webhook events when clients submit form data to any form.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="webhookEnabled"
                    checked={webhookEnabled}
                    onCheckedChange={setWebhookEnabled}
                  />
                  <Label htmlFor="webhookEnabled">
                    Enable Webhook for All Forms
                  </Label>
                </div>

                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-medium">Notification Settings</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyOnSectionCompletion"
                      checked={notifyOnSectionCompletion}
                      onCheckedChange={setNotifyOnSectionCompletion}
                      disabled={!webhookEnabled}
                    />
                    <Label htmlFor="notifyOnSectionCompletion">
                      Notify on Section Completion
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">
                    Send a webhook notification immediately when a section is completed. This allows you to start processing data while waiting for the full form to be completed.
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notifyOnFormCompletion"
                      checked={notifyOnFormCompletion}
                      onCheckedChange={setNotifyOnFormCompletion}
                      disabled={!webhookEnabled}
                    />
                    <Label htmlFor="notifyOnFormCompletion">
                      Notify on Form Completion
                    </Label>
                  </div>
                  <p className="text-sm text-gray-500 ml-7">
                    Send a webhook notification when all sections of a form are completed. This includes all section data in a single notification.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="webhookSecret">Webhook Secret</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateSecret}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Generate New
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      id="webhookSecret"
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      type="password"
                    />
                    <Button
                      variant="outline"
                      onClick={copySecret}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    This secret is used to sign webhook payloads so you can verify they came from us.
                  </p>
                </div>

                <Alert className="bg-gray-800/50 border-amber-600/30">
                  <AlertTitle className="text-amber-400">Security Note</AlertTitle>
                  <AlertDescription className="text-gray-300">
                    Your webhook URL should be HTTPS and the secret should be kept confidential. 
                    Verify webhook signatures using the X-Webhook-Signature header.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleSave}
                  disabled={updateWebhookMutation.isPending}
                >
                  {updateWebhookMutation.isPending && (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Save Webhook Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">All Form Submissions</CardTitle>
                <CardDescription className="text-gray-400">
                  View submissions from all forms in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {submissionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-1/3 bg-gray-700" />
                        <Skeleton className="h-20 w-full bg-gray-700" />
                      </div>
                    ))}
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No submissions yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submissions.map((submission) => (
                      <div key={submission.id} className="border border-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-white font-medium">
                              {submission.forms?.client_name || 'Unknown Client'} - {new Date(submission.createdAt).toLocaleString()}
                            </h3>
                            <p className="text-sm text-gray-400">
                              Form ID: {submission.formId} | Email: {submission.forms?.client_email || 'Unknown'}
                            </p>
                          </div>
                          <div className="text-right text-xs text-gray-400">
                            <p>IP: {submission.clientIp}</p>
                            <p className="truncate max-w-[200px]">
                              {submission.userAgent}
                            </p>
                          </div>
                        </div>
                        <pre className="bg-gray-800/70 p-3 rounded-md text-gray-300 text-sm overflow-auto">
                          {JSON.stringify(submission.submissionData, null, 2)}
                        </pre>
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