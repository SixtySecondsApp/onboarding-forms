import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase, createTestUser } from "@/lib/supabase";

export default function AdminAuth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setLocation("/admin/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid login credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestUser = async () => {
    setLoading(true);
    try {
      const testEmail = "test@example.com";
      const testPassword = "password123";

      await createTestUser(testEmail, testPassword);

      toast({
        title: "Success",
        description: `Test user created! Email: ${testEmail}, Password: ${testPassword}`,
      });

      // Auto-fill the form
      setEmail(testEmail);
      setPassword(testPassword);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create test user. The user might already exist.",
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
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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