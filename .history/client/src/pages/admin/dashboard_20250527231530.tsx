import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Plus, Mail, Copy, ExternalLink, Loader2, Check, FileText, 
  Trash2, Lock, ToggleLeft, ToggleRight, AlertTriangle, Search,
  Filter, Download, BarChart3, Users, Clock, TrendingUp,
  Eye, Edit, MoreHorizontal, Calendar, Star, Archive,
  RefreshCw, Settings, ChevronDown, SortAsc, SortDesc
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Form } from "@/lib/supabase";
import { generateUniqueSlug } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [formPassword, setFormPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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

  // Analytics calculations
  const analytics = {
    totalForms: forms.length,
    completedForms: forms.filter(f => f.status === 'completed').length,
    inProgressForms: forms.filter(f => f.status === 'in_progress' || (f.progress > 0 && f.status !== 'completed')).length,
    pendingForms: forms.filter(f => f.status === 'pending' || f.progress === 0).length,
    averageProgress: forms.length > 0 ? Math.round(forms.reduce((sum, f) => sum + f.progress, 0) / forms.length) : 0,
    completionRate: forms.length > 0 ? Math.round((forms.filter(f => f.status === 'completed').length / forms.length) * 100) : 0,
    recentActivity: forms.filter(f => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(f.updated_at || f.created_at) > dayAgo;
    }).length
  };

  // Filter and sort forms
  const filteredForms = forms
    .filter(form => {
      const matchesSearch = form.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.client_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || form.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'client_name':
          aValue = a.client_name.toLowerCase();
          bValue = b.client_name.toLowerCase();
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
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

      // Invalidate queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["forms"] });

      // Reset form and close dialog
      setNewClient({ client_name: "", client_email: "" });
      setIsCreateOpen(false);

      // Show success message
      toast({
        title: "Success",
        description: `Onboarding form created for ${newClient.client_name}`,
      });

    } catch (error: any) {
      console.error('Error creating form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create form",
      });
    }
  };

  const sendReminder = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/reminder`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send reminder');
      }

      // Update the last_reminder timestamp
      await supabase
        .from('forms')
        .update({ last_reminder: new Date().toISOString() })
        .eq('id', formId);

      queryClient.invalidateQueries({ queryKey: ["forms"] });

      toast({
        title: "Reminder sent",
        description: "Email reminder has been sent to the client",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send reminder",
      });
    }
  };

  const copyFormUrl = (form: Form) => {
    const url = getFormUrl(form);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Form URL has been copied to clipboard",
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
    toggleFormStatusMutation.mutate({ formId: form.id, isEnabled: !form.is_disabled });
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
    if (selectedForm && formPassword) {
      setFormPasswordMutation.mutate({ formId: selectedForm.id, password: formPassword });
    }
  };

  const getStatusBadge = (form: Form) => {
    if (form.is_disabled) {
      return <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Disabled</Badge>;
    }
    
    switch (form.status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-400">Pending</Badge>;
    }
  };

  const exportData = () => {
    const csvData = forms.map(form => ({
      'Client Name': form.client_name,
      'Email': form.client_email,
      'Progress': `${form.progress}%`,
      'Status': form.status,
      'Created': new Date(form.created_at).toLocaleDateString(),
      'Last Updated': form.updated_at ? new Date(form.updated_at).toLocaleDateString() : 'Never',
      'Last Reminder': form.last_reminder ? new Date(form.last_reminder).toLocaleDateString() : 'Never'
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-forms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-500">{error.message}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Client Onboarding Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and track your client onboarding progress</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["forms"] })}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={exportData}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create New Client Onboarding</DialogTitle>
                  <DialogDescription>
                    Start a new client onboarding process by providing their details below.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={newClient.client_name}
                      onChange={(e) =>
                        setNewClient({ ...newClient, client_name: e.target.value })
                      }
                      placeholder="Enter client or company name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.client_email}
                      onChange={(e) =>
                        setNewClient({ ...newClient, client_email: e.target.value })
                      }
                      placeholder="client@company.com"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    Create Onboarding Form
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalForms}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.recentActivity} active in last 24h
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.completedForms} of {analytics.totalForms} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Across all active forms
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.inProgressForms}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.pendingForms} pending start
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <CardTitle className="text-xl font-semibold">Client Forms</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('in_progress')}>
                      In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                      Sort
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                      Date Created
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('client_name')}>
                      Client Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('progress')}>
                      Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('status')}>
                      Status
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                      {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchTerm || statusFilter !== 'all' ? 'No forms match your filters' : 'No clients added yet'}
                </p>
                <p className="text-gray-400 text-sm">
                  {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Create your first client onboarding form to get started'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-b hover:bg-transparent">
                    <TableHead>Client</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow
                      key={form.id}
                      className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b transition-colors ${form.is_disabled ? 'opacity-60' : ''}`}
                      onClick={() => openForm(form)}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {form.client_name}
                            {form.password && (
                              <Lock className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {form.client_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={form.progress} 
                            className="w-[100px]"
                          />
                          <span className={`text-sm font-medium ${
                            form.status === 'completed' 
                              ? 'text-emerald-600' 
                              : 'text-gray-600'
                          }`}>
                            {form.progress}%
                          </span>
                          {form.status === 'completed' && (
                            <Check className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(form)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(form.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {form.updated_at 
                            ? new Date(form.updated_at).toLocaleDateString()
                            : 'No activity'
                          }
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-1">
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
                                  className="h-8 w-8"
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
                                  className="h-8 w-8"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send Reminder</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => e.stopPropagation()}
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                openForm(form);
                              }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Form
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleSetFormPassword(e, form)}>
                                <Lock className="w-4 h-4 mr-2" />
                                {form.password ? 'Change Password' : 'Set Password'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleToggleFormStatus(e, form)}>
                                {form.is_disabled ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 mr-2" />
                                    Enable Form
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 mr-2" />
                                    Disable Form
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteForm(e, form)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Delete Form
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the form for <strong>{selectedForm?.client_name}</strong>? 
                This action cannot be undone and all form data will be permanently lost.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDeleteForm}
                disabled={deleteFormMutation.isPending}
              >
                {deleteFormMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Form'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Password Dialog */}
        <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Form Password</DialogTitle>
              <DialogDescription>
                Set a password to protect the form for <strong>{selectedForm?.client_name}</strong>. 
                Clients will need to enter this password to access the form.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Enter a secure password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmSetPassword}
                disabled={!formPassword || setFormPasswordMutation.isPending}
              >
                {setFormPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting...
                  </>
                ) : (
                  'Set Password'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}