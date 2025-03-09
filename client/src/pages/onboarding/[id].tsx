import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Card, CardContent } from "@/components/ui/card";
import { getFormData, getFormBySlug } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateUniqueSlug } from "@/lib/utils";

export default function OnboardingPage() {
  const { id } = useParams();
  const { toast } = useToast();
  console.log("Form ID or slug from params:", id);
  
  // Add a mutation to create the form if it doesn't exist
  const createFormMutation = useMutation({
    mutationFn: async () => {
      try {
        console.log('Creating form with ID/slug:', id);
        
        // Try to get the current user, but don't require it
        let userId = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        } catch (authError) {
          console.log('No authenticated user, continuing as public access');
        }
        
        // Create a new form with the specified ID or a new slug
        const { data, error } = await supabase
          .from('forms')
          .insert({
            id: id.includes('-') ? undefined : id, // Only use as ID if it's not a slug format
            client_name: 'New Client',
            client_email: 'client@example.com',
            progress: 0,
            status: 'pending',
            data: {},
            created_by: userId, // This can be null for public forms
            slug: id.includes('-') ? id : generateUniqueSlug('new-client') // Use the ID as slug if it looks like a slug
          })
          .select();
        
        if (error) throw error;
        
        return data[0];
      } catch (error) {
        console.error('Error creating form:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form", id] });
      toast({
        title: "Form Created",
        description: "The form has been created successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create form: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });
  
  const { data: form, isLoading, error } = useQuery({
    queryKey: ["form", id],
    queryFn: async () => {
      try {
        console.log("Fetching form data for ID/slug:", id);
        
        // Try to get the form by ID first
        try {
          const data = await getFormData(id);
          console.log("Form data found by ID:", data);
          return data;
        } catch (idError) {
          console.log("Form not found by ID, trying slug...");
          
          // If that fails, try to get it by slug
          try {
            const data = await getFormBySlug(id);
            console.log("Form data found by slug:", data);
            return data;
          } catch (slugError) {
            console.error("Form not found by slug either:", slugError);
            throw new Error("Form not found by ID or slug");
          }
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        throw err;
      }
    },
    retry: 1, // Only retry once to avoid too many failed requests
    retryDelay: 1000, // Wait 1 second before retrying
  });

  if (isLoading || createFormMutation.isPending) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">
          {createFormMutation.isPending ? "Creating form..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (error || !form) {
    console.error("Error or no form:", error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
              <p className="text-gray-500">
                The onboarding form you're looking for doesn't exist or has expired.
              </p>
              <p className="text-gray-500 mt-2">
                Error details: {error ? (error as Error).message : "No form data found"}
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => createFormMutation.mutate()}
                  className="mr-2"
                  disabled={createFormMutation.isPending}
                >
                  Create Form
                </Button>
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline"
                  className="mr-2"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OnboardingForm formId={form.id} />;
}
