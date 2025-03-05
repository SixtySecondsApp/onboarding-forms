import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Mail, Copy, Link, ExternalLink } from "lucide-react";
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
import type { InsertForm, OnboardingForm } from "@shared/schema";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    clientName: "",
    clientEmail: "",
  });

  const { data: forms = [] } = useQuery<OnboardingForm[]>({
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

  const createFormMutation = useMutation({
    mutationFn: async (data: InsertForm) => {
      const { data: form, error } = await supabase
        .from('forms')
        .insert({
          ...data,
          progress: 0,
          status: 'pending',
          data: {},
          last_reminder: null
        })
        .select()
        .single();
      
      if (error) throw error;
      return form;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      setIsCreateOpen(false);
      setNewClient({ clientName: "", clientEmail: "" });

      // Show success message with form URL
      const formUrl = `${window.location.origin}/onboarding/${data.id}`;
      toast({
        title: "Success",
        description: "New client onboarding created",
      });

      // Show dialog with form URL
      navigator.clipboard.writeText(formUrl).then(() => {
        toast({
          title: "Form URL Copied",
          description: "Share this URL with your client to start the onboarding process",
        });
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (formId: number) => {
      const { error } = await supabase
        .from('forms')
        .update({ last_reminder: new Date().toISOString() })
        .eq('id', formId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
      toast({
        title: "Success",
        description: "Reminder email sent",
      });
    },
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation("/admin");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFormMutation.mutateAsync(newClient);
  };

  const getFormUrl = (formId: number) => {
    return `${window.location.origin}/onboarding/${formId}`;
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
    window.open(getFormUrl(formId), '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="max-w-6xl mx-auto relative">
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
              <DialogContent className="bg-gray-900/50 backdrop-blur-xl border-gray-800/50 shadow-2xl data-[state=open]:bg-gradient-to-br data-[state=open]:from-gray-900/95 data-[state=open]:via-gray-800/95 data-[state=open]:to-gray-900/95">
                <DialogHeader className="space-y-1">
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
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
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
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
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
                        <div className="font-medium text-white">{form.clientName}</div>
                        <div className="text-sm text-gray-400">
                          {form.clientEmail}
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
                        {form.lastReminder
                          ? new Date(form.lastReminder).toLocaleDateString()
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
                          sendReminderMutation.mutate(form.id);
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}