import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAuth from "@/pages/admin/auth";
import OnboardingPage from "@/pages/onboarding/[id]";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AdminAuth} />
      <Route path="/admin" component={AdminAuth} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/onboarding/:id" component={OnboardingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;