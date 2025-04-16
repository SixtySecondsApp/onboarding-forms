import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className={`
              ${theme === 'dark' 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border-gray-700' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 shadow-sm'}
              ${className || ''}
            `}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function SidebarThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const isExpanded = state === 'expanded';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size={isExpanded ? "default" : "icon"}
            onClick={toggleTheme}
            className={`
              flex items-center
              ${theme === 'dark'
                ? 'text-gray-200 hover:bg-gray-800 hover:text-white'
                : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'}
              ${isExpanded ? 'justify-start' : 'justify-center'}
            `}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                {isExpanded && <span className="ml-2">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                {isExpanded && <span className="ml-2">Dark Mode</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" hidden={isExpanded}>
          <p>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
} 