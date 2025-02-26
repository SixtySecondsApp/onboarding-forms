import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Card, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
  const { id } = useParams();
  const { data: form, isLoading, error } = useQuery({
    queryKey: ["/api/forms", id],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Form Not Found</h1>
              <p className="text-gray-500">
                The onboarding form you're looking for doesn't exist or has expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <OnboardingForm formId={id} />;
}
