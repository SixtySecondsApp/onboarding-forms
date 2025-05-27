import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/theme-context';
import { 
  Search, 
  HelpCircle, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone, 
  ExternalLink, 
  ChevronRight,
  ChevronDown,
  FileText,
  Video,
  Download,
  Lightbulb,
  Settings,
  Users,
  Zap,
  Shield,
  Globe,
  Code,
  Webhook,
  Bell,
  BarChart3,
  Headphones,
  Clock,
  CheckCircle2,
  AlertCircle,
  Info,
  Star,
  ArrowRight,
  PlayCircle,
  BookOpen,
  Rocket,
  Target,
  Palette,
  Database
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function HelpPage() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Topics', icon: Book },
    { id: 'getting-started', label: 'Getting Started', icon: Rocket },
    { id: 'forms', label: 'Form Management', icon: FileText },
    { id: 'webhooks', label: 'Webhooks & API', icon: Webhook },
    { id: 'customization', label: 'Customization', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Settings }
  ];

  const quickActions = [
    {
      title: 'Create Your First Form',
      description: 'Get started by creating your first onboarding form',
      icon: Rocket,
      action: 'Create Form',
      href: '/admin/dashboard'
    },
    {
      title: 'Setup Webhooks',
      description: 'Configure webhooks to receive real-time notifications',
      icon: Webhook,
      action: 'Configure',
      href: '/admin/webhook-settings'
    },
    {
      title: 'View Documentation',
      description: 'Browse our comprehensive API documentation',
      icon: Code,
      action: 'Read Docs',
      href: '/admin/api-docs'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: Headphones,
      action: 'Get Help',
      href: '#contact'
    }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I create my first onboarding form?',
      answer: 'To create your first form, go to the Dashboard and click "Create New Form". Enter the client\'s name and email, then share the generated link with them. The form will guide them through each step of the onboarding process.'
    },
    {
      category: 'getting-started',
      question: 'What information do clients need to provide?',
      answer: 'Clients will provide business details (company name, type, contact info), target audience information, campaign objectives, brand assets (colors, logos, materials), and any specific requirements for their project.'
    },
    {
      category: 'forms',
      question: 'How can I track form completion progress?',
      answer: 'The Dashboard shows real-time progress for all forms. You can see completion percentages, current status, and when clients last accessed their forms. You can also send reminder emails to clients who haven\'t completed their forms.'
    },
    {
      category: 'forms',
      question: 'Can I customize the form fields?',
      answer: 'Currently, the form structure is optimized for onboarding workflows. However, you can customize branding, colors, and add custom questions in the additional requirements section.'
    },
    {
      category: 'forms',
      question: 'How do I password protect a form?',
      answer: 'When creating a form, you can set an optional password. Clients will need to enter this password before accessing the form. This is useful for sensitive projects or when you want to control access.'
    },
    {
      category: 'webhooks',
      question: 'What are webhooks and why should I use them?',
      answer: 'Webhooks allow your systems to receive real-time notifications when forms are completed. This enables automatic processing, integration with your CRM, or triggering other workflows in your business.'
    },
    {
      category: 'webhooks',
      question: 'How do I set up webhook notifications?',
      answer: 'Go to Settings > Webhooks, enter your endpoint URL, and optionally generate a secret for security. Test the webhook to ensure it\'s working correctly. You\'ll receive POST requests with form data when clients complete their forms.'
    },
    {
      category: 'webhooks',
      question: 'What data is included in webhook payloads?',
      answer: 'Webhook payloads include the event type, timestamp, form ID, client information, completion status, and all submitted form data including business details, campaign info, audience data, and brand assets.'
    },
    {
      category: 'customization',
      question: 'Can I add my own branding to the forms?',
      answer: 'Yes! You can customize the form appearance including colors, fonts, and add your logo. The forms are designed to maintain a professional appearance while reflecting your brand identity.'
    },
    {
      category: 'customization',
      question: 'How do I export form data?',
      answer: 'You can export form data as CSV files from the Dashboard or Submissions tab. This includes all client information and their responses, formatted for easy import into other systems.'
    },
    {
      category: 'analytics',
      question: 'What analytics are available?',
      answer: 'The Analytics section shows completion rates, average time to complete, form performance over time, and client engagement metrics. This helps you optimize your onboarding process.'
    },
    {
      category: 'analytics',
      question: 'How can I improve form completion rates?',
      answer: 'Monitor analytics to identify where clients drop off, send timely reminders, ensure forms are mobile-friendly, and consider breaking complex sections into smaller steps.'
    },
    {
      category: 'troubleshooting',
      question: 'Why isn\'t my webhook receiving data?',
      answer: 'Check that your webhook URL is accessible, returns a 200 status code, and handles POST requests. Use the webhook test feature to verify connectivity. Check your server logs for any errors.'
    },
    {
      category: 'troubleshooting',
      question: 'A client says they can\'t access their form',
      answer: 'Verify the form link is correct, check if the form has a password, ensure the form isn\'t disabled, and confirm the client is using a supported browser. You can also regenerate the form link if needed.'
    },
    {
      category: 'troubleshooting',
      question: 'How do I reset a client\'s form progress?',
      answer: 'Currently, form progress cannot be reset. If a client needs to start over, you can create a new form for them or contact support for assistance with specific cases.'
    }
  ];

  const tutorials = [
    {
      title: 'Getting Started with Onboarding Forms',
      description: 'Learn the basics of creating and managing client onboarding forms',
      duration: '5 min read',
      type: 'guide',
      category: 'getting-started',
      icon: BookOpen
    },
    {
      title: 'Setting Up Webhook Notifications',
      description: 'Configure webhooks to integrate with your existing systems',
      duration: '8 min read',
      type: 'guide',
      category: 'webhooks',
      icon: Webhook
    },
    {
      title: 'Customizing Form Appearance',
      description: 'Brand your forms to match your company identity',
      duration: '6 min read',
      type: 'guide',
      category: 'customization',
      icon: Palette
    },
    {
      title: 'Understanding Analytics Dashboard',
      description: 'Make data-driven decisions with form analytics',
      duration: '4 min read',
      type: 'guide',
      category: 'analytics',
      icon: BarChart3
    },
    {
      title: 'API Integration Tutorial',
      description: 'Integrate onboarding forms with your applications',
      duration: '12 min read',
      type: 'technical',
      category: 'webhooks',
      icon: Code
    },
    {
      title: 'Best Practices for Client Onboarding',
      description: 'Tips to improve your onboarding process and completion rates',
      duration: '7 min read',
      type: 'guide',
      category: 'getting-started',
      icon: Target
    }
  ];

  const supportChannels = [
    {
      title: 'Email Support',
      description: 'Get help via email within 24 hours',
      icon: Mail,
      contact: 'support@onboardingforms.com',
      availability: '24/7',
      responseTime: 'Within 24 hours'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team in real-time',
      icon: MessageCircle,
      contact: 'Available in app',
      availability: 'Mon-Fri 9AM-6PM EST',
      responseTime: 'Immediate'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our technical team',
      icon: Phone,
      contact: '+1 (555) 123-4567',
      availability: 'Mon-Fri 9AM-5PM EST',
      responseTime: 'Immediate'
    },
    {
      title: 'Community Forum',
      description: 'Connect with other users and share tips',
      icon: Users,
      contact: 'community.onboardingforms.com',
      availability: '24/7',
      responseTime: 'Community driven'
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} mb-4`}>
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers, learn best practices, and get the most out of your onboarding forms
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search for help articles, guides, and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{action.description}</p>
                    <Button variant="outline" size="sm" className="gap-2">
                      {action.action}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="gap-2"
            >
              <category.icon className="w-4 h-4" />
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* FAQs */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>

            {filteredFaqs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No FAQs found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'} mt-1`}>
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="ml-10 pb-4">
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* Tutorials & Guides */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-2xl font-bold">Tutorials & Guides</h2>
            </div>

            {filteredTutorials.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tutorials found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredTutorials.map((tutorial, index) => (
                  <Card key={index} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} group-hover:scale-110 transition-transform`}>
                          <tutorial.icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{tutorial.title}</h3>
                            <Badge variant={tutorial.type === 'technical' ? 'destructive' : 'secondary'} className="text-xs">
                              {tutorial.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {tutorial.duration}
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2 group-hover:gap-3 transition-all">
                              Read Guide
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Channels */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Need More Help?</h2>
            <p className="text-muted-foreground">Our support team is here to help you succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'} mb-4`}>
                    <channel.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{channel.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{channel.contact}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Available:</span>
                      <span className="font-medium">{channel.availability}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Response:</span>
                      <span className="font-medium">{channel.responseTime}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 gap-2">
                    <channel.icon className="w-4 h-4" />
                    Contact
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Additional Resources
            </CardTitle>
            <CardDescription>
              Explore more ways to get help and stay updated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">API Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Complete reference for developers
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    View Docs
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <Video className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Video Tutorials</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Step-by-step video guides
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    Watch Videos
                    <PlayCircle className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`p-2 rounded ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                  <Download className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium mb-1">Download Resources</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Templates and best practices
                  </p>
                  <Button variant="outline" size="sm" className="gap-2">
                    Download
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback */}
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30' : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'}`}>
          <CardContent className="p-8 text-center">
            <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Was this helpful?</h3>
            <p className="text-muted-foreground mb-6">
              Help us improve our documentation and support resources
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Yes, helpful
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                Needs improvement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 