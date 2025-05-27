import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import { ChevronRight, FileText, Video, BookOpen, HelpCircle } from 'lucide-react';

export default function Help() {
  const { theme } = useTheme();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Help & Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Guides, tutorials and support resources for the Onboarding Forms application.
          </p>
        </div>

        <Tabs defaultValue="guides">
          <TabsList>
            <TabsTrigger value="guides">User Guides</TabsTrigger>
            <TabsTrigger value="tutorials">Video Tutorials</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="guides" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started Guide</CardTitle>
                <CardDescription>
                  Learn how to set up and start using the Onboarding Forms application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Admin Dashboard Overview</h3>
                        <p className="text-sm text-muted-foreground">Learn about the main admin dashboard features</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Creating Your First Onboarding Form</h3>
                        <p className="text-sm text-muted-foreground">Step-by-step guide to creating and sending forms</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Setting Up Webhooks</h3>
                        <p className="text-sm text-muted-foreground">Learn how to integrate with external systems using webhooks</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Customizing Form Templates</h3>
                        <p className="text-sm text-muted-foreground">Guide to modifying and creating custom form templates</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Managing Client Submissions</h3>
                        <p className="text-sm text-muted-foreground">Learn how to review, export, and manage form submissions</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Administrative Guides</h3>
                  <div className="space-y-4">
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                        <div>
                          <h3 className="font-medium">User Management</h3>
                          <p className="text-sm text-muted-foreground">Managing admin users and permissions</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                        <div>
                          <h3 className="font-medium">Notification Settings</h3>
                          <p className="text-sm text-muted-foreground">Configure email notifications and reminders</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-200 hover:border-gray-300'} cursor-pointer flex items-center justify-between group transition-all duration-200`}>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-purple-500" />
                        <div>
                          <h3 className="font-medium">System Configuration</h3>
                          <p className="text-sm text-muted-foreground">Advanced system settings and configurations</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tutorials" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Video Tutorials</CardTitle>
                <CardDescription>
                  Watch video guides for using the Onboarding Forms platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} cursor-pointer group`}>
                    <div className={`aspect-video mb-2 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Getting Started with Onboarding Forms</h3>
                    <p className="text-sm text-muted-foreground">5 min tutorial</p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} cursor-pointer group`}>
                    <div className={`aspect-video mb-2 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Creating Custom Form Templates</h3>
                    <p className="text-sm text-muted-foreground">7 min tutorial</p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} cursor-pointer group`}>
                    <div className={`aspect-video mb-2 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Webhook Integration Guide</h3>
                    <p className="text-sm text-muted-foreground">10 min tutorial</p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} cursor-pointer group`}>
                    <div className={`aspect-video mb-2 rounded bg-gray-100 dark:bg-gray-800 relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="h-10 w-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <h3 className="font-medium mt-2">Advanced Dashboard Features</h3>
                    <p className="text-sm text-muted-foreground">8 min tutorial</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline">View All Tutorials</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="faq" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Common questions and answers about the Onboarding Forms platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                      How do I reset my password?
                    </h3>
                    <p className="text-sm mt-2 pl-6">
                      To reset your password, click on the "Forgot Password" link on the login page. You'll receive an email with instructions to reset your password.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Can I edit a form after a client has submitted it?
                    </h3>
                    <p className="text-sm mt-2 pl-6">
                      Yes, you can edit a form after submission. Navigate to the form in the dashboard, click "View Submission" and then "Edit". Any changes will be tracked in the revision history.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                      How do I set up reminders for incomplete forms?
                    </h3>
                    <p className="text-sm mt-2 pl-6">
                      Go to the Notifications page in the admin dashboard, select the "Client Reminders" tab, and configure your reminder schedule and messages.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                      Can I export form data to other systems?
                    </h3>
                    <p className="text-sm mt-2 pl-6">
                      Yes, you can export data in CSV format or connect to external systems using our webhook functionality. For direct integrations, check the API documentation.
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h3 className="font-medium flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                      How secure is the client data submitted through forms?
                    </h3>
                    <p className="text-sm mt-2 pl-6">
                      All data is encrypted in transit using HTTPS and at rest in our database. We implement strict access controls and regular security audits to ensure data protection.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center">
                  <p className="text-sm mr-2">Don't see your question?</p>
                  <Button variant="link" className="p-0 h-auto">Contact Support</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>
                  Get help from our support team when you need it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className={`p-6 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                    <h3 className="font-medium text-lg mb-2">Contact Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Our support team is available Monday-Friday, 9am-5pm EST.
                    </p>
                    <Button>Submit a Support Ticket</Button>
                  </div>
                  
                  <div className={`p-6 rounded-md border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} text-center`}>
                    <h3 className="font-medium text-lg mb-2">Schedule a Call</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Book a one-on-one call with our customer success team.
                    </p>
                    <Button variant="outline">Schedule Appointment</Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Additional Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Button variant="link" className="p-0 h-auto">System Status Page</Button>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">All Systems Operational</span>
                    </li>
                    <li>
                      <Button variant="link" className="p-0 h-auto">Release Notes</Button>
                      <span className="ml-2 text-xs text-muted-foreground">Last updated: June 15, 2023</span>
                    </li>
                    <li>
                      <Button variant="link" className="p-0 h-auto">Developer Documentation</Button>
                    </li>
                    <li>
                      <Button variant="link" className="p-0 h-auto">Community Forum</Button>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 