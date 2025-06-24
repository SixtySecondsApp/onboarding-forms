import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { getForms, createForm, updateForm, deleteForm, type Form } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/theme-context';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Copy, 
  Send, 
  Trash2, 
  Lock, 
  Unlock,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity,
  FileText,
  Mail,
  ExternalLink,
  Settings,
  RefreshCw,
  SortAsc,
  SortDesc,
  ChevronDown,
  User,
  Building2,
  Target,
  Zap
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'progress' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [newFormData, setNewFormData] = useState({
    client_name: '',
    client_email: '',
    password: ''
  });

  // Data fetching
  const { data: forms = [], isLoading, refetch } = useQuery({
    queryKey: ['forms'],
    queryFn: getForms,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Mutations
  const createFormMutation = useMutation({
    mutationFn: createForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setShowCreateDialog(false);
      setNewFormData({ client_name: '', client_email: '', password: '' });
      toast({
        title: "Form created successfully",
        description: "The onboarding form has been created and is ready to send.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating form",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Form> }) => updateForm(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      toast({
        title: "Form updated successfully",
        description: "The form has been updated.",
      });
    },
  });

  const deleteFormMutation = useMutation({
    mutationFn: deleteForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] });
      setShowDeleteDialog(false);
      setSelectedForm(null);
      toast({
        title: "Form deleted successfully",
        description: "The form has been permanently deleted.",
      });
    },
  });

  // Analytics calculations
  const analytics = React.useMemo(() => {
    const totalForms = forms.length;
    const completedForms = forms.filter(f => f.status === 'completed').length;
    const inProgressForms = forms.filter(f => f.status === 'in_progress').length;
    const pendingForms = forms.filter(f => f.status === 'pending').length;
    
    const completionRate = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
    const averageProgress = totalForms > 0 ? Math.round(forms.reduce((sum, form) => sum + form.progress, 0) / totalForms) : 0;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = forms.filter(f => new Date(f.updated_at) > sevenDaysAgo).length;
    
    return {
      totalForms,
      completedForms,
      inProgressForms,
      pendingForms,
      completionRate,
      averageProgress,
      recentActivity
    };
  }, [forms]);

  // Filtering and sorting
  const filteredAndSortedForms = React.useMemo(() => {
    let filtered = forms.filter(form => {
      const matchesSearch = form.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           form.client_email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || form.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
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
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [forms, searchTerm, filterStatus, sortBy, sortOrder]);

  // Event handlers
  const handleLogout = async () => {
    // Implement logout logic
    window.location.href = '/admin/auth';
  };

  const getFormUrl = (form: Form) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/onboarding/${form.slug || form.id}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFormData.client_name || !newFormData.client_email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in both client name and email.",
        variant: "destructive",
      });
      return;
    }

    createFormMutation.mutate({
      client_name: newFormData.client_name,
      client_email: newFormData.client_email,
      status: 'pending',
      progress: 0,
      data: {},
      password: newFormData.password || null,
    });
  };

  const sendReminder = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/remind`, {
        method: 'POST',
      });
      
      if (response.ok) {
        await updateFormMutation.mutateAsync({
          id: formId,
          data: { last_reminder: new Date().toISOString() }
        });
        toast({
          title: "Reminder sent",
          description: "Email reminder has been sent to the client.",
        });
      } else {
        throw new Error('Failed to send reminder');
      }
    } catch (error) {
      toast({
        title: "Error sending reminder",
        description: "Failed to send the reminder email.",
        variant: "destructive",
      });
    }
  };

  const copyFormUrl = (form: Form) => {
    const url = getFormUrl(form);
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Form URL has been copied to clipboard.",
    });
  };

  const openForm = (form: Form) => {
    const url = getFormUrl(form);
    window.open(url, '_blank');
  };

  const handleDeleteForm = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setSelectedForm(form);
    setShowDeleteDialog(true);
  };

  const handleToggleFormStatus = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    const newStatus = form.is_disabled ? false : true;
    updateFormMutation.mutate({
      id: form.id,
      data: { is_disabled: newStatus }
    });
  };

  const handleSetFormPassword = (e: React.MouseEvent, form: Form) => {
    e.stopPropagation();
    setSelectedForm(form);
    setShowPasswordDialog(true);
  };

  const confirmDeleteForm = () => {
    if (selectedForm) {
      deleteFormMutation.mutate(selectedForm.id);
    }
  };

  const confirmSetPassword = () => {
    if (selectedForm) {
      updateFormMutation.mutate({
        id: selectedForm.id,
        data: { password: newFormData.password || null }
      });
      setShowPasswordDialog(false);
      setNewFormData(prev => ({ ...prev, password: '' }));
    }
  };

  const getStatusBadge = (form: Form) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    };
    
    const icons = {
      pending: Clock,
      in_progress: Activity,
      completed: CheckCircle2
    };
    
    const Icon = icons[form.status];
    
    return (
      <Badge className={`${variants[form.status]} border-0 font-medium`}>
        <Icon className="w-3 h-3 mr-1" />
        {form.status.replace('_', ' ')}
      </Badge>
    );
  };

  const exportData = () => {
    const csvContent = [
      ['Client Name', 'Email', 'Status', 'Progress', 'Created', 'Last Updated'],
      ...filteredAndSortedForms.map(form => [
        form.client_name,
        form.client_email,
        form.status,
        `${form.progress}%`,
        new Date(form.created_at).toLocaleDateString(),
        new Date(form.updated_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding-forms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your onboarding forms and track client progress
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4" />
              Create Form
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Forms</p>
                <p className="text-3xl font-bold mt-2">{analytics.totalForms}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.recentActivity} active this week
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold mt-2">{analytics.completionRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.completedForms} of {analytics.totalForms} completed
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'}`}>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Progress</p>
                <p className="text-3xl font-bold mt-2">{analytics.averageProgress}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.inProgressForms} in progress
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-3xl font-bold mt-2">{analytics.recentActivity}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updates in last 7 days
                </p>
              </div>
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-xl border p-6 ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by client name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Status: {filterStatus === 'all' ? 'All' : filterStatus.replace('_', ' ')}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                    Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('in_progress')}>
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('completed')}>
                    Completed
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    Sort: {sortBy}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    Date Created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
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

              <Button variant="outline" onClick={exportData} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Forms Table */}
        <div className={`rounded-xl border ${theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'} shadow-sm overflow-hidden`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">Onboarding Forms</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredAndSortedForms.length} of {forms.length} forms
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading forms...</p>
            </div>
          ) : filteredAndSortedForms.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No forms found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first onboarding form.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Your First Form
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Client</th>
                    <th className="text-left p-4 font-medium text-sm">Status</th>
                    <th className="text-left p-4 font-medium text-sm">Progress</th>
                    <th className="text-left p-4 font-medium text-sm">Created</th>
                    <th className="text-left p-4 font-medium text-sm">Last Updated</th>
                    <th className="text-right p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedForms.map((form) => (
                    <tr 
                      key={form.id} 
                      className={`hover:${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'} transition-colors cursor-pointer`}
                      onClick={() => openForm(form)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{form.client_name}</div>
                            <div className="text-sm text-muted-foreground">{form.client_email}</div>
                          </div>
                          {form.is_disabled && (
                            <Lock className="w-4 h-4 text-red-500" />
                          )}
                          {form.password && (
                            <div className={`px-2 py-1 rounded text-xs ${theme === 'dark' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                              Protected
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {getStatusBadge(form)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-1 h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden`}>
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                              style={{ width: `${form.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12 text-right">{form.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(form.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(form.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openForm(form); }}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Form
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyFormUrl(form); }}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy URL
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); sendReminder(form.id); }}>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={(e) => handleToggleFormStatus(e, form)}>
                                {form.is_disabled ? (
                                  <>
                                    <Unlock className="w-4 h-4 mr-2" />
                                    Enable Form
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Disable Form
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => handleSetFormPassword(e, form)}>
                                <Settings className="w-4 h-4 mr-2" />
                                Set Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => handleDeleteForm(e, form)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Onboarding Form</DialogTitle>
            <DialogDescription>
              Create a new onboarding form for a client. They'll receive an email with the form link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name</Label>
              <Input
                id="client_name"
                placeholder="Enter client name"
                value={newFormData.client_name}
                onChange={(e) => setNewFormData(prev => ({ ...prev, client_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_email">Client Email</Label>
              <Input
                id="client_email"
                type="email"
                placeholder="Enter client email"
                value={newFormData.client_email}
                onChange={(e) => setNewFormData(prev => ({ ...prev, client_email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Set a password to protect the form"
                value={newFormData.password}
                onChange={(e) => setNewFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createFormMutation.isPending}>
                {createFormMutation.isPending ? 'Creating...' : 'Create Form'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Form</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the form for "{selectedForm?.client_name}"? 
              This action cannot be undone and all form data will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteForm}
              disabled={deleteFormMutation.isPending}
            >
              {deleteFormMutation.isPending ? 'Deleting...' : 'Delete Form'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Form Password</DialogTitle>
            <DialogDescription>
              Set a password to protect the form for "{selectedForm?.client_name}". 
              Leave empty to remove password protection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="form_password">Password</Label>
              <Input
                id="form_password"
                type="password"
                placeholder="Enter password or leave empty to remove"
                value={newFormData.password}
                onChange={(e) => setNewFormData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSetPassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}