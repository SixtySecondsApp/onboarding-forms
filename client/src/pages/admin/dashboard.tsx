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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
    queryKey: ["/api/forms"],
  });

  const createFormMutation = useMutation({
    mutationFn: async (data: InsertForm) => {
      const response = await apiRequest("POST", "/api/forms", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
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
      await apiRequest("POST", `/api/forms/${formId}/reminder`);
    },
    onSuccess: () => {
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
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Client Onboarding</h1>
          <div className="space-x-4">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Client
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Client Onboarding</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={newClient.clientName}
                      onChange={(e) =>
                        setNewClient({ ...newClient, clientName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.clientEmail}
                      onChange={(e) =>
                        setNewClient({ ...newClient, clientEmail: e.target.value })
                      }
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Reminder</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forms.map((form) => (
                  <TableRow key={form.id} className="cursor-pointer hover:bg-gray-800/50" onClick={() => openForm(form.id)}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{form.clientName}</div>
                        <div className="text-sm text-gray-500">
                          {form.clientEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Progress value={form.progress} className="w-[100px]" />
                      <span className="text-sm text-gray-500 ml-2">
                        {form.progress}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{form.status}</span>
                    </TableCell>
                    <TableCell>
                      {form.lastReminder
                        ? new Date(form.lastReminder).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyFormUrl(form.id);
                        }}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendReminderMutation.mutate(form.id);
                        }}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reminder
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          openForm(form.id);
                        }}
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