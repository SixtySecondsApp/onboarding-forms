# 60 Seconds Onboarding Application

A streamlined client onboarding application that allows clients to complete an onboarding form in just 60 seconds.

## Features

- **User Authentication**: Secure admin login to manage client onboarding
- **Client Invitation**: Invite clients to complete the onboarding form
- **Progress Tracking**: Live tracking of client progress on the admin dashboard
- **Multi-step Form**: Intuitive form with sections that can be completed independently
- **Progress Saving**: Automatic saving of form progress at each step
- **Welcome Screen**: Engaging welcome screen introducing clients to the onboarding process
- **Completion Celebration**: Confetti animation when clients complete the form
- **Information Summary**: Summary of provided information on completion

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account for database and authentication

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd 60-seconds-onboarding
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   # Server-side environment variables (for API/backend)
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Client-side environment variables (for frontend)
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: Database connection (if using direct database access)
   DATABASE_URL=your_database_connection_string
   
   # Development
   NODE_ENV=development
   PORT=3000
   ```
   
   **Important**: For production deployment on Vercel, you need to set these environment variables in your Vercel project settings.

4. Start the development server
   ```
   npm run dev
   ```

## Testing the Application

### Manual Testing

To test the application manually, follow these steps:

1. **Admin Authentication**:
   - Navigate to `/admin`
   - Log in with your admin credentials
   - You should be redirected to the admin dashboard

2. **Creating a Client Onboarding**:
   - On the admin dashboard, click "New Client"
   - Fill in the client name and email
   - Click "Create Onboarding"
   - The form URL will be copied to your clipboard

3. **Client Onboarding Process**:
   - Open the form URL in a new browser tab
   - You should see the welcome screen
   - Click "Let's Get Started" to begin the onboarding process
   - Fill out each section of the form
   - After completing each section, click "Complete Section" to save and move to the next section
   - You can navigate between sections using the left sidebar
   - The progress bar at the bottom left shows your overall progress

4. **Form Completion**:
   - After completing all sections, click "Complete Onboarding" on the final section
   - You should see a confetti animation and a completion screen with a summary of your information

5. **Admin Dashboard Tracking**:
   - Return to the admin dashboard
   - The client's progress should be updated in real-time
   - When the form is completed, the status should change to "completed" and progress to 100%

### Automated Testing

To run the automated end-to-end tests:

1. Install Playwright
   ```
   npm install -D @playwright/test
   npx playwright install
   ```

2. Set up test environment variables
   Create a `.env.test` file with:
   ```
   TEST_ADMIN_EMAIL=your_test_admin_email
   TEST_ADMIN_PASSWORD=your_test_admin_password
   ```

3. Run the tests
   ```
   npx playwright test
   ```

## Project Structure

- `client/src/`: Frontend source code
  - `components/`: React components
    - `onboarding/`: Onboarding form components
  - `pages/`: Application pages
    - `admin/`: Admin pages (auth, dashboard)
    - `onboarding/`: Client onboarding pages
  - `lib/`: Utility functions and API clients
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions

- `server/`: Backend code (if applicable)
- `tests/`: Automated tests
- `supabase/`: Supabase configuration and migrations

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Theme Support

The application supports both light and dark modes. The theme system works as follows:

### Theme Context

- Uses React Context API to provide theme state and toggle functionality across the application
- Stores theme preference in localStorage for persistence between sessions
- Default theme is dark mode if no preference is stored

### Theme Toggles

There are two theme toggle components:

1. **ThemeToggle**: Used in the admin dashboard sidebar and other admin pages
2. **OnboardingThemeToggle**: Used in onboarding forms with a slightly different styling

### Usage

To use the theme functionality in a component:

```jsx
import { useTheme } from '@/lib/theme-context';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

### Styling for Dark/Light Modes

The application uses Tailwind CSS for styling with the `dark:` variant for dark mode specific styles. For example:

```jsx
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
  Theme-aware content
</div>
```

### Testing

Theme functionality is fully tested in `tests/theme.test.tsx` with tests for:
- Default theme initialization
- Loading stored theme preferences
- Toggling between themes
- Rendering theme toggle components

## Troubleshooting

### 404 Errors on Form Loading

If you're experiencing 404 errors when trying to load onboarding forms, check the following:

1. **Environment Variables**: Ensure all required environment variables are set:
   - For local development: Create a `.env` file with all variables listed above
   - For Vercel deployment: Set environment variables in your Vercel project settings

2. **Build Process**: Make sure the application is properly built:
   ```bash
   npm run build
   ```

3. **Supabase Configuration**: Verify your Supabase project is set up correctly:
   - Database tables exist (forms, form_sections, etc.)
   - Row Level Security (RLS) policies are configured
   - API keys are valid and have the correct permissions

4. **Network Issues**: Check browser developer tools for:
   - Failed API requests to `/api/forms`
   - CORS errors
   - Network connectivity issues

5. **Vercel Deployment**: For production deployments:
   - Ensure `vercel.json` is properly configured
   - Check Vercel function logs for errors
   - Verify all environment variables are set in Vercel dashboard

### Common Solutions

- **Missing Environment Variables**: The most common cause of 404 errors is missing `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables
- **Supabase Connection**: Verify your Supabase URL and keys are correct
- **Build Issues**: Try deleting `node_modules` and `dist` folders, then run `npm install && npm run build` 