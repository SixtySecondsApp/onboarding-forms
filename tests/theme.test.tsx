import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { OnboardingThemeToggle } from '@/components/onboarding/ThemeToggle';
import React from 'react';

// Mock component that displays current theme
const ThemeDisplay = () => {
  const { theme } = useTheme();
  return <div data-testid="theme-display">{theme}</div>;
};

describe('Theme Context and Toggle', () => {
  // Setup localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = String(value);
      }),
      clear: vi.fn(() => {
        store = {};
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
    };
  })();

  // Setup document.documentElement.classList mock
  const originalClassList = document.documentElement.classList;
  const mockClassList = {
    add: vi.fn(),
    remove: vi.fn(),
    toggle: vi.fn(),
  };

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    Object.defineProperty(document.documentElement, 'classList', { 
      value: mockClassList,
      writable: true 
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(document.documentElement, 'classList', { 
      value: originalClassList 
    });
  });

  it('should initialize with dark theme by default', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-display').textContent).toBe('dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
  });

  it('should load theme from localStorage if available', () => {
    localStorageMock.getItem.mockReturnValueOnce('light');
    
    render(
      <ThemeProvider>
        <ThemeDisplay />
      </ThemeProvider>
    );
    
    expect(screen.getByTestId('theme-display').textContent).toBe('light');
    expect(mockClassList.toggle).toHaveBeenCalledWith('dark', false);
  });

  it('should toggle theme when ThemeToggle is clicked', () => {
    render(
      <ThemeProvider>
        <ThemeDisplay />
        <ThemeToggle />
      </ThemeProvider>
    );
    
    // Initial state should be dark
    expect(screen.getByTestId('theme-display').textContent).toBe('dark');
    
    // Click the toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Theme should change to light
    expect(screen.getByTestId('theme-display').textContent).toBe('light');
    expect(mockClassList.remove).toHaveBeenCalledWith('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
    
    // Click again to toggle back to dark
    fireEvent.click(toggleButton);
    
    // Theme should change back to dark
    expect(screen.getByTestId('theme-display').textContent).toBe('dark');
    expect(mockClassList.add).toHaveBeenCalledWith('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should render OnboardingThemeToggle correctly', () => {
    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );
    
    // Should find the toggle button
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
    
    // Should have the correct styling
    expect(toggleButton.classList.contains('rounded-full')).toBe(true);
  });
}); 