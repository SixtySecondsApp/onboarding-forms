import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Mail, Copy, ExternalLink, Loader2 } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/types/supabase";

type Form = Database['public']['Tables']['forms']['Row'];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    clientName: "",
    clientEmail: "",
  });

  const { data: forms = [], isLoading, error } = useQuery<Form[]>({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/admin");
  };

  // Update URL construction methods to avoid double slashes
  const getFormUrl = (formId: number) => {
    const baseUrl = window.location.origin.replace(/\/$/, '');
    return `${baseUrl}/onboarding/${formId}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First check if we have an authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to create forms');
      }

      const { data: form, error } = await supabase
        .from('forms')
        .insert({
          client_name: newClient.clientName,
          client_email: newClient.clientEmail,
          progress: 0,
          status: 'pending',
          data: {},
          created_by: user.id // Add creator ID for RLS
        })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setIsCreateOpen(false);
      setNewClient({ clientName: "", clientEmail: "" });

      toast({
        title: "Success",
        description: "New client onboarding created",
      });

      const formUrl = getFormUrl(form.id);
      navigator.clipboard.writeText(formUrl).then(() => {
        toast({
          title: "Form URL Copied",
          description: "Share this URL with your client to start the onboarding process",
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

  const sendReminder = async (formId: number) => {
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

  const copyFormUrl = (formId: number) => {
    const url = getFormUrl(formId);
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Form URL has been copied to clipboard",
      });
    });
  };

  const openForm = (formId: number) => {
    const url = getFormUrl(formId);
    window.open(url, '_blank');
  };

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
          <div className="space-x-4">
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
                      value={newClient.clientName}
                      onChange={(e) =>
                        setNewClient({ ...newClient, clientName: e.target.value })
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
                      value={newClient.clientEmail}
                      onChange={(e) =>
                        setNewClient({ ...newClient, clientEmail: e.target.value })
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
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="bg-white/10 hover:bg-white/20 text-white font-medium border-0"
            >
              Logout
            </Button>
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
                      className="cursor-pointer hover:bg-gray-800/50 border-b border-gray-800/50"
                      onClick={() => openForm(form.id)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{form.client_name}</div>
                          <div className="text-sm text-gray-400">
                            {form.client_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Progress value={form.progress} className="w-[100px] bg-gray-800" />
                          <span className="text-sm text-gray-400 ml-2">
                            {form.progress}%
                          </span>
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
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyFormUrl(form.id);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium border-0"
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            sendReminder(form.id);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium border-0"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send Reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openForm(form.id);
                          }}
                          className="bg-white/10 hover:bg-white/20 text-white font-medium border-0"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Form
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}