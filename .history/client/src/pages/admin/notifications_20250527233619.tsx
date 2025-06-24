import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/lib/theme-context';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  Users, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Send,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Volume2,
  VolumeX,
  Star,
  Archive,
  ExternalLink,
  Zap,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationsPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Notification settings
  const [emailSettings, setEmailSettings] = useState({
    formCompletions: true,
    clientReminders: true,
    systemAlerts: false,
    weeklyReports: true,
    webhookFailures: true,
    newFormCreated: false
  });

  const [reminderSettings, setReminderSettings] = useState({
    enabled: true,
    firstReminder: 24, // hours
    secondReminder: 72, // hours
    finalReminder: 168, // hours (1 week)
    customMessage: ''
  });

  // Mock notification history
  const notifications = [
    {
      id: '1',
      type: 'form_completion',
      title: 'Form Completed - Acme Corp',
      message: 'John Doe from Acme Corp has completed their onboarding form.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actions: ['View Form', 'Send Thank You']
    },
    {
      id: '2',
      type: 'reminder_sent',
      title: 'Reminder Sent - TechStart Inc',
      message: 'Automatic reminder sent to Sarah Johnson for incomplete form.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      actions: ['View Form']
    },
    {
      id: '3',
      type: 'system_alert',
      title: 'Webhook Delivery Failed',
      message: 'Failed to deliver webhook for form submission to https://api.example.com/webhook',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      actions: ['Retry Webhook', 'Check Settings']
    },
    {
      id: '4',
      type: 'weekly_report',
      title: 'Weekly Report Available',
      message: 'Your weekly onboarding report is ready with 12 new completions.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      actions: ['View Report']
    }
  ];

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    high: notifications.filter(n => n.priority === 'high').length,
    today: notifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.timestamp);
      return notifDate.toDateString() === today.toDateString();
    }).length
  };

  const handleEmailToggle = (setting: keyof typeof emailSettings) => {
    setEmailSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'form_completion':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'reminder_sent':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'system_alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'weekly_report':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Manage notification settings and view recent alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Notifications</p>
                  <p className="text-3xl font-bold mt-2">{notificationStats.total}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread</p>
                  <p className="text-3xl font-bold mt-2">{notificationStats.unread}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                  <Mail className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-3xl font-bold mt-2">{notificationStats.high}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'}`}>
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today</p>
                  <p className="text-3xl font-bold mt-2">{notificationStats.today}</p>
                </div>
                <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="gap-2">
              <Bell className="w-4 h-4" />
              Notification History
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email Settings
            </TabsTrigger>
            <TabsTrigger value="reminders" className="gap-2">
              <Clock className="w-4 h-4" />
              Reminders
            </TabsTrigger>
          </TabsList>

          {/* Notification History */}
          <TabsContent value="history" className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="form_completion">Form Completions</SelectItem>
                  <SelectItem value="reminder_sent">Reminders</SelectItem>
                  <SelectItem value="system_alert">System Alerts</SelectItem>
                  <SelectItem value="weekly_report">Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notifications List */}
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No notifications found.</p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-6 hover:${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} transition-colors ${
                          !notification.read ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium">{notification.title}</h3>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  )}
                                  <Badge className={`text-xs ${getPriorityColor(notification.priority)} border-0`}>
                                    {notification.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                                  <div className="flex items-center gap-2">
                                    {notification.actions.map((action, index) => (
                                      <Button key={index} variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                        {action}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Star className="w-4 h-4" />
                                    Star
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2">
                                    <Archive className="w-4 h-4" />
                                    Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="gap-2 text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure which events trigger email notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries({
                  formCompletions: {
                    label: "Form Completions",
                    description: "Get notified when clients complete their onboarding forms"
                  },
                  clientReminders: {
                    label: "Client Reminders",
                    description: "Receive notifications when automatic reminders are sent"
                  },
                  systemAlerts: {
                    label: "System Alerts",
                    description: "Important system notifications and maintenance updates"
                  },
                  weeklyReports: {
                    label: "Weekly Reports",
                    description: "Receive weekly summary reports of form activity"
                  },
                  webhookFailures: {
                    label: "Webhook Failures",
                    description: "Get alerted when webhook deliveries fail"
                  },
                  newFormCreated: {
                    label: "New Form Created",
                    description: "Notification when new forms are created by team members"
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
          </TabsContent>

          {/* Reminders */}
          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Automatic Reminders
                </CardTitle>
                <CardDescription>
                  Configure automatic reminder emails for incomplete forms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reminders-enabled">Enable Automatic Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Send automatic reminder emails to clients with incomplete forms
                    </p>
                  </div>
                  <Switch
                    id="reminders-enabled"
                    checked={reminderSettings.enabled}
                    onCheckedChange={(checked) => setReminderSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {reminderSettings.enabled && (
                  <div className="space-y-6 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first-reminder">First Reminder</Label>
                        <Select
                          value={reminderSettings.firstReminder.toString()}
                          onValueChange={(value) => setReminderSettings(prev => ({ ...prev, firstReminder: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">72 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="second-reminder">Second Reminder</Label>
                        <Select
                          value={reminderSettings.secondReminder.toString()}
                          onValueChange={(value) => setReminderSettings(prev => ({ ...prev, secondReminder: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">72 hours</SelectItem>
                            <SelectItem value="96">96 hours</SelectItem>
                            <SelectItem value="120">5 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="final-reminder">Final Reminder</Label>
                        <Select
                          value={reminderSettings.finalReminder.toString()}
                          onValueChange={(value) => setReminderSettings(prev => ({ ...prev, finalReminder: parseInt(value) }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="120">5 days</SelectItem>
                            <SelectItem value="168">1 week</SelectItem>
                            <SelectItem value="336">2 weeks</SelectItem>
                            <SelectItem value="720">1 month</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-message">Custom Message (Optional)</Label>
                      <Input
                        id="custom-message"
                        placeholder="Add a personal touch to your reminder emails..."
                        value={reminderSettings.customMessage}
                        onChange={(e) => setReminderSettings(prev => ({ ...prev, customMessage: e.target.value }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        This message will be included in all reminder emails
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Save Reminder Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reminder Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Reminder Email Preview</CardTitle>
                <CardDescription>
                  Preview how your reminder emails will look to clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`p-6 rounded-lg border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Reminder: Complete Your Onboarding Form</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-2">
                      <p>Hi [Client Name],</p>
                      <p>We noticed you haven't completed your onboarding form yet. We'd love to help you get started with your project!</p>
                      {reminderSettings.customMessage && (
                        <p className="italic">{reminderSettings.customMessage}</p>
                      )}
                      <p>Click the link below to continue where you left off:</p>
                      <p className="text-blue-500">[Form Link]</p>
                      <p>If you have any questions, feel free to reach out to our team.</p>
                      <p>Best regards,<br />Your Team</p>
                    </div>
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