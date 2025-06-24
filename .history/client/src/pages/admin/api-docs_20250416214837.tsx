import React from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';

export default function ApiDocs() {
  const { theme } = useTheme();
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Integrate with our API to programmatically manage onboarding forms.
          </p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="authentication">Authentication</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Onboarding Forms API</CardTitle>
                <CardDescription>
                  Our RESTful API enables you to integrate the onboarding form functionality into your applications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>Base URL: <code className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>https://api.onboardingforms.example/v1</code></p>
                <p>All API requests must include your API key for authentication.</p>
                <p>The API returns responses in JSON format.</p>
                
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Getting Started</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Generate an API key in the <Button variant="link" className="px-0" onClick={() => window.location.href = '/admin/webhook-settings'}>Webhook Settings</Button> section</li>
                    <li>Use the API key in all requests as described in the Authentication tab</li>
                    <li>Follow the endpoint documentation to create and manage forms</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="authentication" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>
                  All API requests require authentication using an API key.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="text-lg font-medium">API Key Authentication</h3>
                <p>Include your API key in the <code>Authorization</code> header of all requests:</p>
                
                <div className={`p-4 rounded mt-2 overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <pre className="text-sm">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                  </pre>
                </div>
                
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md mt-4 dark:bg-yellow-900 dark:text-yellow-200">
                  <p className="text-sm font-medium">Security Notice</p>
                  <p className="text-xs mt-1">Never expose your API key in client-side code. Always make API requests from your server.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="endpoints" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Available endpoints for managing onboarding forms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Forms</h3>
                    <ul className="space-y-4">
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">GET</span>
                          <span className="font-mono ml-2">/forms</span>
                        </div>
                        <p className="text-sm mt-1">List all forms</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">GET</span>
                          <span className="font-mono ml-2">/forms/{'{id}'}</span>
                        </div>
                        <p className="text-sm mt-1">Get a specific form by ID</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200">POST</span>
                          <span className="font-mono ml-2">/forms</span>
                        </div>
                        <p className="text-sm mt-1">Create a new form</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200">PUT</span>
                          <span className="font-mono ml-2">/forms/{'{id}'}</span>
                        </div>
                        <p className="text-sm mt-1">Update an existing form</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-200">DELETE</span>
                          <span className="font-mono ml-2">/forms/{'{id}'}</span>
                        </div>
                        <p className="text-sm mt-1">Delete a form</p>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Submissions</h3>
                    <ul className="space-y-4">
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">GET</span>
                          <span className="font-mono ml-2">/forms/{'{id}'}/submissions</span>
                        </div>
                        <p className="text-sm mt-1">List all submissions for a form</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200">POST</span>
                          <span className="font-mono ml-2">/forms/{'{id}'}/submissions</span>
                        </div>
                        <p className="text-sm mt-1">Create a new submission</p>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Webhooks</h3>
                    <ul className="space-y-4">
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200">GET</span>
                          <span className="font-mono ml-2">/webhooks</span>
                        </div>
                        <p className="text-sm mt-1">List all registered webhooks</p>
                      </li>
                      <li>
                        <div className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          <span className="font-mono text-sm px-2 py-1 rounded bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200">POST</span>
                          <span className="font-mono ml-2">/webhooks</span>
                        </div>
                        <p className="text-sm mt-1">Register a new webhook endpoint</p>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
                <CardDescription>
                  Sample code for common API operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="text-lg font-medium mb-2">Creating a Form</h3>
                <div className={`p-4 rounded overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <pre className="text-sm">
                    <code>{`// Using fetch API
const response = await fetch('https://api.onboardingforms.example/v1/forms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    name: 'Client Onboarding',
    description: 'Basic client information collection',
    sections: [
      {
        title: 'Basic Information',
        fields: [
          { name: 'company_name', type: 'text', required: true },
          { name: 'contact_email', type: 'email', required: true }
        ]
      }
    ]
  })
});

const data = await response.json();
console.log(data);
`}</code>
                  </pre>
                </div>

                <h3 className="text-lg font-medium mt-6 mb-2">Retrieving Submissions</h3>
                <div className={`p-4 rounded overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <pre className="text-sm">
                    <code>{`// Using fetch API
const formId = '123e4567-e89b-12d3-a456-426614174000';
const response = await fetch(\`https://api.onboardingforms.example/v1/forms/\${formId}/submissions\`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});

const submissions = await response.json();
console.log(submissions);
`}</code>
                  </pre>
                </div>

                <div className="mt-6">
                  <Button onClick={() => window.open('/docs/api-reference.pdf')}>
                    Download Full API Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 