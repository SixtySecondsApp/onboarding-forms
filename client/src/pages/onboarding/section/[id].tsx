import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Card, CardContent } from "@/components/ui/card";
import { getSectionData } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function SharedSectionPage() {
  const { id } = useParams();
  console.log("Shared section ID:", id);
  
  const { data: section, isLoading, error } = useQuery({
    queryKey: ["section", id],
    queryFn: async () => {
      try {
        const data = await getSectionData(id);
        console.log("Section data:", data);
        return data;
      } catch (err) {
        console.error("Error fetching section:", err);
        throw err;
      }
    },
    retry: 1, // Only retry once to avoid too many failed requests
    retryDelay: 1000, // Wait 1 second before retrying
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading shared section...</div>
      </div>
    );
  }

  if (error || !section) {
    console.error("Error or no section:", error);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Section Not Found</h1>
              <p className="text-gray-500">
                The shared section you're looking for doesn't exist or has expired.
              </p>
              <p className="text-gray-500 mt-2">
                Error details: {error ? (error as Error).message : "No section data found"}
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline"
                  className="mr-2"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
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

  // Make sure form_id exists before rendering the OnboardingForm
  if (!section.form_id) {
    console.error("Section has no form_id:", section);
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Invalid Section</h1>
              <p className="text-gray-500">
                This section is missing required data and cannot be displayed.
              </p>
              <div className="mt-4">
                <Button 
                  onClick={() => window.history.back()} 
                  variant="outline"
                  className="mr-2"
                >
                  Go Back
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
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

  return <OnboardingForm formId={section.form_id} sectionId={id} />;
} 