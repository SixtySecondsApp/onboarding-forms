import React from 'react';
import { useLocation } from 'wouter';
import { 
  Home, 
  Settings, 
  FileText, 
  Bell, 
  LogOut,
  HelpCircle
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarProvider, 
  SidebarContent, 
  SidebarFooter,
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme-context';
import { SidebarThemeToggle } from '@/components/ui/theme-toggle';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/admin');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-16 items-center border-b border-sidebar-border px-4 py-2">
            <h1 className="text-lg font-bold text-sidebar-foreground">Onboarding Admin</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setLocation('/admin/dashboard')}
                  isActive={location === '/admin/dashboard'}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setLocation('/admin/webhook-settings')}
                  isActive={location === '/admin/webhook-settings'}
                >
                  <Settings className="h-4 w-4" />
                  <span>Webhook Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setLocation('/admin/api-docs')}
                  isActive={location === '/admin/api-docs'}
                >
                  <FileText className="h-4 w-4" />
                  <span>API Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setLocation('/admin/notifications')}
                  isActive={location === '/admin/notifications'}
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setLocation('/admin/help')}
                  isActive={location === '/admin/help'}
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              className={`${theme === 'dark' ? 'text-gray-200 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <div className="p-6 h-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 