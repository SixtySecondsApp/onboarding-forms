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
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

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