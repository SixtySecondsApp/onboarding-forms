import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingThemeToggle } from '@/components/onboarding/ThemeToggle';
import { ThemeProvider } from '@/lib/theme-context';

// Mock the localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value;
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key: string) {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('OnboardingThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
  });

  it('renders correctly with default theme (dark)', () => {
    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
    // Default is dark mode, so we should find a sun icon for toggling to light mode
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );

    // Find and click the toggle button
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // After clicking once, we should have switched to light mode and see a moon icon
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();

    // Click again to switch back to dark mode
    fireEvent.click(toggleButton);
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
  });

  it('uses theme from localStorage', () => {
    // Set theme to light in localStorage
    window.localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );

    // Since theme is set to light, we should see a moon icon for toggling to dark mode
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('has the correct styling in dark mode', () => {
    window.localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-800/80');
    expect(button).toHaveClass('text-gray-100');
    expect(button).toHaveClass('border-gray-700');
  });

  it('has the correct styling in light mode', () => {
    window.localStorage.setItem('theme', 'light');

    render(
      <ThemeProvider>
        <OnboardingThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white/90');
    expect(button).toHaveClass('text-gray-800');
    expect(button).toHaveClass('border-gray-300');
  });
}); 