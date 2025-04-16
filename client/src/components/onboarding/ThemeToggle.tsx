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

export function OnboardingThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="fixed top-5 right-5 z-50">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className={`
                rounded-full shadow-md backdrop-blur-md transition-all duration-200
                ${theme === 'dark' 
                  ? 'bg-gray-800/80 hover:bg-gray-700/90 text-gray-100 border-gray-700 hover:border-gray-600' 
                  : 'bg-white/90 hover:bg-gray-100/90 text-gray-800 border-gray-300 hover:border-gray-400'}
              `}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 