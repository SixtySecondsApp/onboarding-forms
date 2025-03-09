import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus, Mail, Copy, ExternalLink, Loader2, Check, FileText, 
  Trash2, Lock, ToggleLeft, ToggleRight, Sun, Moon, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, 
  DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Form } from "@/lib/supabase";
import { generateUniqueSlug } from "@/lib/utils";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formPassword, setFormPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [newClient, setNewClient] = useState({
    client_name: "",
    client_email: "",
  });

  const { data: forms = [], isLoading, error } = useQuery<Form[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Forms loaded:', data);
      return data;
    }
  });

  // Mutation for deleting a form
  const deleteFormMutation = useMutation({
    mutationFn: async (formId: string) => {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);
      
      if (error) throw error;
      return formId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Success",
        description: "Form deleted successfully",
      });
      setIsDeleteOpen(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete form",
      });
    }
  });

  // Mutation for toggling form status (enable/disable)
  const toggleFormStatusMutation = useMutation({
    mutationFn: async ({ formId, isEnabled }: { formId: string, isEnabled: boolean }) => {
      const { error } = await supabase
        .from('forms')
        .update({ is_disabled: !isEnabled })
        .eq('id', formId);
      
      if (error) throw error;
      return { formId, isEnabled: !isEnabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Success",
        description: "Form status updated",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update form status",
      });
    }
  });

  // Mutation for setting form password
  const setFormPasswordMutation = useMutation({
    mutationFn: async ({ formId, password }: { formId: string, password: string }) => {
      const { error } = await supabase
        .from('forms')
        .update({ password: password })
        .eq('id', formId);
      
      if (error) throw error;
      return { formId, password };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Success",
        description: "Form password set successfully",
      });
      setIsPasswordOpen(false);
      setFormPassword("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to set form password",
      });
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/admin");
  };

  // Update URL construction methods to use slugs
  const getFormUrl = (form: Form) => {
    const baseUrl = window.location.origin.replace(/\/$/, '');
    return `${baseUrl}/onboarding/${form.slug || form.id}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First check if we have an authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create forms');
      }

      // Generate a unique slug for the new client
      const slug = generateUniqueSlug(newClient.client_name);
      console.log('Creating form with slug:', slug);

      // Create the form without specifying an ID (let Supabase generate it)
      const { data: form, error } = await supabase
        .from('forms')
        .insert({
          client_name: newClient.client_name,
          client_email: newClient.client_email,
          progress: 0,
          status: 'pending',
          data: {},
          created_by: user.id,
          slug: slug,
          is_disabled: false,
          password: null
        })
        .select();

      if (error) {
        console.error('Supabase error creating form:', error);
        throw error;
      }

      if (!form || form.length === 0) {
        console.error('No form data returned after creation');
        throw new Error('Failed to create form: No data returned');
      }

      console.log('Form created successfully:', form[0]);

      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setIsCreateOpen(false);
      setNewClient({ client_name: "", client_email: "" });

      toast({
        title: "Success",
        description: "New client onboarding created",
      });

      // Use the first form in the array
      const formUrl = getFormUrl(form[0]);
      console.log('Form URL generated:', formUrl);
      
      navigator.clipboard.writeText(formUrl).then(() => {
        toast({
          title: "Form URL Copied",
          description: "Share this URL with your client to start the onboarding process",
        });
      }).catch(clipboardError => {
        console.error('Error copying to clipboard:', clipboardError);
        // Still show the URL even if clipboard fails
        toast({
          title: "Form URL",
          description: `Share this URL with your client: ${formUrl}`,
        });
      });
    } catch (error: any) {
      console.error('Error creating form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create new client onboarding",
        variant: "destructive"
      });
    }
  };

  const sendReminder = async (formId: string) => {
    try {
      const { error } = await supabase
        .from('forms')
        .update({ last_reminder: new Date().toISOString() })
        .eq('id', formId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Success",
        description: "Reminder email sent",
      });
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const copyFormUrl = (form: Form) => {
    const url = getFormUrl(form);
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Form URL has been copied to clipboard",
      });
    });
  };

  const openForm = (form: Form) => {
    const url = getFormUrl(form);
    window.open(url, '_blank');
  };

  const handleDeleteForm = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setSelectedForm(form);
    setIsDeleteOpen(true);
  };

  const handleToggleFormStatus = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    toggleFormStatusMutation.mutate({ 
      formId: form.id, 
      isEnabled: !form.is_disabled 
    });
  };

  const handleSetFormPassword = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setSelectedForm(form);
    setIsPasswordOpen(true);
  };

  const confirmDeleteForm = () => {
    if (selectedForm) {
      deleteFormMutation.mutate(selectedForm.id);
    }
  };

  const confirmSetPassword = () => {
    if (selectedForm) {
      setFormPasswordMutation.mutate({ 
        formId: selectedForm.id, 
        password: formPassword 
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Update the theme in the document
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    // Store the preference in localStorage
    localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
  };

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Default to dark mode if no preference is stored
      document.documentElement.classList.add('dark');
    }
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Client Onboarding</h1>
            <p className="text-gray-400 mt-1">Manage and track your client onboarding progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleTheme}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {isDarkMode ? 'Light' : 'Dark'} Mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setLocation("/admin/api-docs")}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>API Documentation</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-800/50 shadow-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-white">Create New Client Onboarding</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Start a new client onboarding process by providing their details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-gray-300">Client Name</Label>
                    <Input
                      id="clientName"
                      value={newClient.client_name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, client_name: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail" className="text-gray-300">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.client_email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, client_email: e.target.value })
                      }
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Create Onboarding
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-2xl">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-xl font-semibold text-white">Client Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : forms.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No clients added yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Client</TableHead>
                    <TableHead className="text-gray-400">Progress</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Last Reminder</TableHead>
                    <TableHead className="text-right text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {forms.map((form) => (
                    <TableRow
                      key={form.id}
                      className={`cursor-pointer hover:bg-gray-800/50 border-b border-gray-800/50 ${form.is_disabled ? 'opacity-60' : ''}`}
                      onClick={() => openForm(form)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-white flex items-center">
                            {form.client_name}
                            {form.is_disabled && (
                              <span className="ml-2 text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded">Disabled</span>
                            )}
                            {form.password && (
                              <span className="ml-2 text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded">Password Protected</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {form.client_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Progress 
                            value={form.progress} 
                            className={`w-[100px] bg-gray-800 ${
                              form.status === 'completed' 
                                ? 'text-emerald-500' 
                                : form.progress > 75 
                                  ? 'text-emerald-400' 
                                  : form.progress > 50 
                                    ? 'text-amber-400' 
                                    : form.progress > 25 
                                      ? 'text-amber-500' 
                                      : 'text-gray-500'
                            }`}
                          />
                          <span className={`text-sm ml-2 ${
                            form.status === 'completed' 
                              ? 'text-emerald-500 font-medium' 
                              : 'text-gray-400'
                          }`}>
                            {form.progress}%
                          </span>
                          {form.status === 'completed' && (
                            <span className="ml-2 text-emerald-500">
                              <Check className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-gray-300">{form.status}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-400">
                          {form.last_reminder
                            ? new Date(form.last_reminder).toLocaleDateString()
                            : "Never"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyFormUrl(form);
                                  }}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy Link</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    sendReminder(form.id);
                                  }}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send Reminder</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => handleToggleFormStatus(e, form)}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  {form.is_disabled ? (
                                    <ToggleLeft className="w-4 h-4 text-red-400" />
                                  ) : (
                                    <ToggleRight className="w-4 h-4 text-emerald-400" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{form.is_disabled ? 'Enable Form' : 'Disable Form'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => handleSetFormPassword(e, form)}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  <Lock className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{form.password ? 'Change Password' : 'Set Password'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openForm(form);
                                  }}
                                  className="h-8 w-8 bg-white/10 hover:bg-white/20 text-white border-0"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open Form</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={(e) => handleDeleteForm(e, form)}
                                  className="h-8 w-8 bg-white/10 hover:bg-red-900/20 text-white hover:text-red-400 border-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Form</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-800/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this form? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-4 bg-red-900/20 border border-red-800/50 rounded-lg mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
            <div>
              <p className="text-red-400 font-medium">Warning</p>
              <p className="text-red-300/80 text-sm">
                Deleting this form will remove all associated data and cannot be recovered.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteForm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Setting Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="bg-gray-900/95 backdrop-blur-xl border-gray-800/50 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedForm?.password ? 'Change Form Password' : 'Set Form Password'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedForm?.password 
                ? 'Update the password required to access this form.'
                : 'Set a password to restrict access to this form.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="formPassword" className="text-gray-300">Password</Label>
              <Input
                id="formPassword"
                type="password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Enter a secure password"
                className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
              <p className="text-sm text-gray-500">
                Leave blank to remove password protection.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmSetPassword}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}