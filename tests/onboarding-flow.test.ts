import { test, expect } from '@playwright/test';

/**
 * End-to-End Test for Onboarding Flow
 * 
 * This test verifies the complete flow from admin creating a form to client completing it,
 * and checks that progress is correctly tracked and displayed in the admin dashboard.
 */

test.describe('Onboarding Flow', () => {
  let formUrl: string;
  
  test('Admin can create a new client onboarding form', async ({ page }) => {
    // Login as admin
    await page.goto('/admin');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'password');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/admin/dashboard');
    
    // Create new client
    await page.click('button:has-text("New Client")');
    await page.fill('input#clientName', 'Test Client');
    await page.fill('input#clientEmail', 'testclient@example.com');
    await page.click('button:has-text("Create Onboarding")');
    
    // Wait for success toast
    await page.waitForSelector('div:has-text("New client onboarding created")');
    
    // Get the form URL from the clipboard (this is a mock since we can't access clipboard in tests)
    // In a real test, we would need to intercept the network request or use a test-specific method
    const formRow = await page.waitForSelector('tr:has-text("Test Client")');
    await formRow.click();
    
    // For testing purposes, we'll extract the URL from the page
    formUrl = await page.url();
    
    // Go back to dashboard
    await page.goto('/admin/dashboard');
    
    // Verify the client appears in the dashboard
    await expect(page.locator('tr:has-text("Test Client")')).toBeVisible();
    
    // Verify initial progress is 0%
    const progressText = await page.locator('tr:has-text("Test Client")').locator('text=0%').first();
    await expect(progressText).toBeVisible();
  });
  
  test('Client can complete the onboarding form', async ({ page }) => {
    // Go to the form URL
    await page.goto(formUrl);
    
    // Welcome screen
    await page.waitForSelector('text=Welcome to 60 Seconds');
    await page.click('button:has-text("Let\'s Get Started")');
    
    // Fill out each section of the form
    
    // Business Info section
    await page.fill('input[name="name"]', 'Test Company');
    await page.fill('input[name="type"]', 'Technology');
    await page.fill('input[name="website"]', 'https://testcompany.com');
    await page.fill('input[name="location"]', 'London, UK');
    await page.click('button:has-text("Complete Section")');
    
    // Campaign Info section
    await page.fill('input[name="campaignName"]', 'Summer Campaign 2023');
    await page.fill('input[name="objective"]', 'Increase brand awareness');
    await page.fill('textarea[name="keyMessages"]', 'Our product is the best in the market');
    await page.click('button:has-text("Complete Section")');
    
    // Audience section
    await page.fill('input[name="jobTitles"]', 'CEO, CTO, Marketing Director');
    await page.click('button:has-text("Technology")'); // Select industry
    await page.click('button:has-text("51-200")'); // Select company size
    await page.fill('input[name="locations"]', 'UK, US, Europe');
    await page.click('button:has-text("Complete Section")');
    
    // Brand Assets section
    await page.fill('input[name="brandName"]', 'TestBrand');
    // Skip logo upload for test
    await page.fill('input[type="color"]', '#00FF00');
    await page.click('button:has-text("Complete Section")');
    
    // Final section
    await page.click('button:has-text("Complete Onboarding")');
    
    // Verify completion screen with confetti
    await page.waitForSelector('text=Congratulations');
    await expect(page.locator('canvas')).toBeVisible(); // Confetti canvas
    
    // Verify information summary
    await expect(page.locator('text=Test Company')).toBeVisible();
    await expect(page.locator('text=Summer Campaign 2023')).toBeVisible();
  });
  
  test('Admin dashboard shows updated progress', async ({ page }) => {
    // Login as admin
    await page.goto('/admin');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'password');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/admin/dashboard');
    
    // Verify the client appears in the dashboard with 100% progress
    const clientRow = await page.locator('tr:has-text("Test Client")');
    await expect(clientRow).toBeVisible();
    
    // Verify progress is 100%
    const progressText = await clientRow.locator('text=100%').first();
    await expect(progressText).toBeVisible();
    
    // Verify status is completed
    const statusText = await clientRow.locator('text=completed').first();
    await expect(statusText).toBeVisible();
  });
}); 