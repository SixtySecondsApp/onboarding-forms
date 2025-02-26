import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase, createTestUser } from "@/lib/supabase";

// Basic email validation
const isValidEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return emailRegex.test(email);
};

export default function AdminAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isValidEmail(email)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setLocation("/admin/dashboard");
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Invalid login credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    setLoading(true);
    try {
      // Generate a unique test email address
      const uniqueId = Math.random().toString(36).substring(2, 8);
      const testEmail = `test.${uniqueId}@replit-test.com`;
      const testPassword = "password123";

      await createTestUser(testEmail, testPassword);

      toast({
        title: "Success",
        description: `Test user created! Email: ${testEmail}, Password: ${testPassword}`,
      });

      // Auto-fill the form
      setEmail(testEmail);
      setPassword(testPassword);
    } catch (error: any) {
      console.error('Create test user error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create test user. The user might already exist.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : "Login"}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="outline"
                onClick={handleCreateTestUser}
                disabled={loading}
                className="w-full mt-2"
              >
                Create Test Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}