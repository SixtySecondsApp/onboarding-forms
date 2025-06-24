import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/lib/theme-context';
import { 
  Code, 
  Copy, 
  ExternalLink, 
  Book, 
  Zap, 
  Shield, 
  Key,
  Globe,
  Database,
  Webhook,
  CheckCircle2,
  AlertCircle,
  Info,
  Terminal,
  FileText,
  Settings,
  Lock,
  Eye,
  Download,
  Play,
  RefreshCw
} from 'lucide-react';

export default function ApiDocs() {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/forms',
      description: 'Retrieve all forms',
      auth: true,
      params: [
        { name: 'status', type: 'string', required: false, description: 'Filter by status (pending, in_progress, completed)' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results to return (default: 50)' }
      ]
    },
    {
      method: 'POST',
      path: '/api/forms',
      description: 'Create a new form',
      auth: true,
      body: {
        client_name: 'string',
        client_email: 'string',
        password: 'string (optional)'
      }
    },
    {
      method: 'GET',
      path: '/api/forms/{id}',
      description: 'Get a specific form',
      auth: true,
      params: [
        { name: 'id', type: 'string', required: true, description: 'Form ID or slug' }
      ]
    },
    {
      method: 'PUT',
      path: '/api/forms/{id}',
      description: 'Update form data',
      auth: true,
      body: {
        data: 'object',
        status: 'string (optional)',
        progress: 'number (optional)'
      }
    }
  ];

  const webhookEvents = [
    {
      event: 'form.completed',
      description: 'Triggered when a client completes their onboarding form',
      payload: {
        event: 'form.completed',
        timestamp: '2024-01-15T10:30:00Z',
        data: {
          formId: 'uuid',
          clientName: 'Acme Corp',
          clientEmail: 'john@acme.com',
          progress: 100,
          submissionData: '{ ... }'
        }
      }
    },
    {
      event: 'form.updated',
      description: 'Triggered when form data is updated (coming soon)',
      payload: {
        event: 'form.updated',
        timestamp: '2024-01-15T10:30:00Z',
        data: {
          formId: 'uuid',
          progress: 75,
          updatedFields: ['businessDetails', 'campaign']
        }
      }
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'} mb-4`}>
            <Code className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Integrate onboarding forms with your applications using our REST API
          </p>
        </div>

        {/* Quick Start */}
        <Card className={`${theme === 'dark' ? 'bg-gradient-to-r from-green-900/20 to-blue-900/20 border-green-500/30' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'}`}>
          <CardContent className="p-8">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Quick Start</h3>
                <p className="text-muted-foreground mb-4">
                  Get started with the Onboarding Forms API in minutes. All endpoints use REST conventions and return JSON.
                </p>
                <div className="flex gap-3">
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Try API
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    Download SDK
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication" className="gap-2">
              <Key className="w-4 h-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="gap-2">
              <Globe className="w-4 h-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="examples" className="gap-2">
              <Code className="w-4 h-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* Authentication */}
          <TabsContent value="authentication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  API Authentication
                </CardTitle>
                <CardDescription>
                  Secure your API requests with proper authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">API Key Authentication</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Include your API key in the Authorization header of all requests:
                  </p>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
                    <pre className="text-sm overflow-x-auto">
                      <code>{`Authorization: Bearer YOUR_API_KEY`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                    >
                      {copiedCode === 'auth-header' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-blue-50 border-blue-200'} border`}>
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Getting your API Key</p>
                      <p className="text-blue-600 dark:text-blue-400 mt-1">
                        API keys can be generated from the Settings page. Keep your keys secure and never expose them in client-side code.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'destructive'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm font-mono">{endpoint.path}</code>
                        {endpoint.auth && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {endpoint.params && (
                      <div>
                        <h5 className="font-medium mb-2">Parameters</h5>
                        <div className="space-y-2">
                          {endpoint.params.map((param, i) => (
                            <div key={i} className="flex items-center gap-4 text-sm">
                              <code className="font-mono">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                              <span className="text-muted-foreground">{param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {endpoint.body && (
                      <div>
                        <h5 className="font-medium mb-2">Request Body</h5>
                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
                          <pre className="text-sm overflow-x-auto">
                            <code>{JSON.stringify(endpoint.body, null, 2)}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyCode(JSON.stringify(endpoint.body, null, 2), `body-${index}`)}
                          >
                            {copiedCode === `body-${index}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Webhook Events
                </CardTitle>
                <CardDescription>
                  Real-time notifications for form events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {webhookEvents.map((webhook, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{webhook.event}</Badge>
                      <span className="text-sm text-muted-foreground">{webhook.description}</span>
                    </div>
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
                      <pre className="text-sm overflow-x-auto">
                        <code>{JSON.stringify(webhook.payload, null, 2)}</code>
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyCode(JSON.stringify(webhook.payload, null, 2), `webhook-${index}`)}
                      >
                        {copiedCode === `webhook-${index}` ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Create a Form</CardTitle>
                  <CardDescription>JavaScript example using fetch</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
                    <pre className="text-sm overflow-x-auto">
                      <code>{`const response = await fetch('/api/forms', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_name: 'Acme Corp',
    client_email: 'john@acme.com'
  })
});

const form = await response.json();
console.log('Form created:', form);`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(`const response = await fetch('/api/forms', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_name: 'Acme Corp',
    client_email: 'john@acme.com'
  })
});

const form = await response.json();
console.log('Form created:', form);`, 'create-form')}
                    >
                      {copiedCode === 'create-form' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Handle Webhooks</CardTitle>
                  <CardDescription>Node.js webhook handler</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} relative`}>
                    <pre className="text-sm overflow-x-auto">
                      <code>{`app.post('/webhook', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'form.completed') {
    console.log('Form completed:', data.formId);
    
    // Process the submission
    processFormSubmission(data);
  }
  
  res.status(200).send('OK');
});`}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyCode(`app.post('/webhook', (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'form.completed') {
    console.log('Form completed:', data.formId);
    
    // Process the submission
    processFormSubmission(data);
  }
  
  res.status(200).send('OK');
});`, 'webhook-handler')}
                    >
                      {copiedCode === 'webhook-handler' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* SDKs and Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              SDKs and Tools
            </CardTitle>
            <CardDescription>
              Official SDKs and tools to accelerate your integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'}`}>
                  <Code className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="font-medium">JavaScript SDK</h4>
                <p className="text-sm text-muted-foreground">
                  Official JavaScript/TypeScript SDK for Node.js and browsers
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-3 h-3" />
                  Download
                </Button>
              </div>

              <div className="text-center space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium">Postman Collection</h4>
                <p className="text-sm text-muted-foreground">
                  Ready-to-use Postman collection for testing the API
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Import
                </Button>
              </div>

              <div className="text-center space-y-3">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium">OpenAPI Spec</h4>
                <p className="text-sm text-muted-foreground">
                  Complete OpenAPI 3.0 specification for code generation
                </p>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-3 h-3" />
                  View Spec
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 