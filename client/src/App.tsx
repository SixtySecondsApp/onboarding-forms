import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/lib/theme-context";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAuth from "@/pages/admin/auth";
import WebhookSettings from "@/pages/admin/webhook-settings";
import OnboardingPage from "@/pages/onboarding/[id]";
import ApiDocs from "@/pages/admin/api-docs";
import Notifications from "@/pages/admin/notifications";
import Help from "@/pages/admin/help";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AdminAuth} />
      <Route path="/admin" component={AdminAuth} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/webhook-settings" component={WebhookSettings} />
      <Route path="/admin/api-docs" component={ApiDocs} />
      <Route path="/admin/notifications" component={Notifications} />
      <Route path="/admin/help" component={Help} />
      <Route path="/onboarding/:id" component={OnboardingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;