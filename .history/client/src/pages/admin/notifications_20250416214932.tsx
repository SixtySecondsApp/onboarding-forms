import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';

export default function Notifications() {
  const { theme } = useTheme();
  const [emailSettings, setEmailSettings] = React.useState({
    formCompletionAlerts: true,
    dailySummary: false,
    clientReminders: true,
    adminNotifications: true
  });

  const handleToggle = (setting: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure email notifications and alerts for your team.
          </p>
        </div>

        <Tabs defaultValue="email">
          <TabsList>
            <TabsTrigger value="email">Email Notifications</TabsTrigger>
            <TabsTrigger value="team">Team Management</TabsTrigger>
            <TabsTrigger value="client">Client Reminders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Alert Settings</CardTitle>
                <CardDescription>
                  Configure which events trigger email notifications to your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="form-completion">Form Completion Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive an email when a client completes an onboarding form
                    </p>
                  </div>
                  <Switch 
                    id="form-completion" 
                    checked={emailSettings.formCompletionAlerts}
                    onCheckedChange={() => handleToggle('formCompletionAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-summary">Daily Summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of all form activity
                    </p>
                  </div>
                  <Switch 
                    id="daily-summary" 
                    checked={emailSettings.dailySummary}
                    onCheckedChange={() => handleToggle('dailySummary')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="client-reminders">Client Reminder Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Be notified when automatic reminders are sent to clients
                    </p>
                  </div>
                  <Switch 
                    id="client-reminders" 
                    checked={emailSettings.clientReminders}
                    onCheckedChange={() => handleToggle('clientReminders')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-notifications">Admin Activity Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about other admin activities
                    </p>
                  </div>
                  <Switch 
                    id="admin-notifications" 
                    checked={emailSettings.adminNotifications}
                    onCheckedChange={() => handleToggle('adminNotifications')}
                  />
                </div>

                <div className="pt-4">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Customize the email templates sent to clients and team members.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className={`p-4 rounded cursor-pointer border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-medium">Form Completion Confirmation</h3>
                    <p className="text-sm text-muted-foreground">Sent to clients when they complete a form</p>
                  </div>
                  
                  <div className={`p-4 rounded cursor-pointer border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-medium">Client Reminder</h3>
                    <p className="text-sm text-muted-foreground">Sent to clients who haven't completed their form</p>
                  </div>
                  
                  <div className={`p-4 rounded cursor-pointer border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-medium">Team Notification</h3>
                    <p className="text-sm text-muted-foreground">Sent to team members for form completions</p>
                  </div>
                  
                  <div className={`p-4 rounded cursor-pointer border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <h3 className="font-medium">Daily Summary</h3>
                    <p className="text-sm text-muted-foreground">Daily activity summary sent to admins</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Notification Settings</CardTitle>
                <CardDescription>
                  Configure which team members receive different types of notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notification-emails">Notification Recipients</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter email addresses that should receive notifications (comma separated)
                    </p>
                    <Input 
                      id="notification-emails" 
                      placeholder="admin@example.com, manager@example.com" 
                      className="max-w-md"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-base font-medium mb-2">Notification Assignments</h3>
                    <div className="border rounded-md divide-y">
                      <div className={`p-4 ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">New Form Submissions</p>
                            <p className="text-sm text-muted-foreground">When clients complete forms</p>
                          </div>
                          <Select defaultValue="all">
                            <option value="all">All Team Members</option>
                            <option value="admins">Admins Only</option>
                            <option value="custom">Custom Selection</option>
                          </Select>
                        </div>
                      </div>
                      
                      <div className={`p-4 ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Client Reminders</p>
                            <p className="text-sm text-muted-foreground">When reminders are sent to clients</p>
                          </div>
                          <Select defaultValue="admins">
                            <option value="all">All Team Members</option>
                            <option value="admins">Admins Only</option>
                            <option value="custom">Custom Selection</option>
                          </Select>
                        </div>
                      </div>
                      
                      <div className={`p-4 ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Daily Summaries</p>
                            <p className="text-sm text-muted-foreground">Daily activity reports</p>
                          </div>
                          <Select defaultValue="custom">
                            <option value="all">All Team Members</option>
                            <option value="admins">Admins Only</option>
                            <option value="custom">Custom Selection</option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button>Save Team Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Client Reminder Settings</CardTitle>
                <CardDescription>
                  Configure automated reminders for clients with incomplete forms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-medium">Reminder Schedule</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure when clients should receive reminders about incomplete forms
                    </p>
                    
                    <div className="space-y-4 max-w-md">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="initial-reminder">Initial Reminder</Label>
                        <Select defaultValue="24h" id="initial-reminder">
                          <option value="12h">12 hours after sending</option>
                          <option value="24h">24 hours after sending</option>
                          <option value="48h">48 hours after sending</option>
                          <option value="72h">72 hours after sending</option>
                        </Select>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="follow-up">Follow-up Reminder</Label>
                        <Select defaultValue="72h" id="follow-up">
                          <option value="48h">48 hours after initial</option>
                          <option value="72h">72 hours after initial</option>
                          <option value="96h">96 hours after initial</option>
                          <option value="168h">1 week after initial</option>
                        </Select>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="final-reminder">Final Reminder</Label>
                        <Select defaultValue="168h" id="final-reminder">
                          <option value="96h">96 hours after initial</option>
                          <option value="168h">1 week after initial</option>
                          <option value="336h">2 weeks after initial</option>
                          <option value="never">Don't send</option>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-base font-medium mb-2">Reminder Message</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Customize the message sent in reminder emails
                    </p>
                    <div className="border p-4 rounded-md">
                      <p className="text-sm mb-2">Hello [Client Name],</p>
                      <p className="text-sm mb-2">This is a friendly reminder to complete your onboarding form. It only takes 60 seconds to complete!</p>
                      <p className="text-sm mb-2">You can access your form here: [Form Link]</p>
                      <p className="text-sm">Thank you,<br />[Company Name] Team</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button>Save Reminder Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// Simple Select component for this page
function Select({ defaultValue, id, children }: { defaultValue: string, id?: string, children: React.ReactNode }) {
  return (
    <select
      id={id}
      defaultValue={defaultValue}
      className="block w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </select>
  );
} 