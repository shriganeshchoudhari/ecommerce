import { test, expect } from '@playwright/test';

test.describe('Module 8 — AI Assistant', () => {

    test.beforeEach(async ({ page }) => {
        // Go to home page
        await page.goto('/');
    });

    test('AI-N01: Chat bubble hidden when not logged in', async ({ page }) => {
        // Ensure we are logged out (default state for a new browser context)
        const chatBubble = page.locator('button[aria-label="Open AI Shopping Assistant"]');
        await expect(chatBubble).toBeHidden();
    });

    test.describe('Authenticated AI Assistant Tests', () => {

        test.beforeEach(async ({ page }) => {
            // Login as customer
            await page.goto('/login');
            await page.fill('input[name="email"]', 'testapi_user@shopease.com');
            await page.fill('input[name="password"]', 'Password123!');
            await page.click('button[type="submit"]');

            // Wait for navigation or successful login indication
            await page.waitForURL('/');
        });

        test('AI-P01: Chat bubble visible after login', async ({ page }) => {
            const chatBubble = page.locator('button[aria-label="Open AI Shopping Assistant"]');
            await expect(chatBubble).toBeVisible();
        });

        test('AI-P02: Click bubble opens chat panel', async ({ page }) => {
            const chatBubble = page.locator('button[aria-label="Open AI Shopping Assistant"]');
            await chatBubble.click();

            // Check for the chat panel header containing "ShopEase Assistant"
            const chatHeader = page.getByText('ShopEase Assistant');
            await expect(chatHeader).toBeVisible();

            // Welcome message should be visible
            await expect(page.getByText("Hi! I'm your ShopEase AI assistant.")).toBeVisible();
        });

        test('AI-N02: Empty message cannot be sent', async ({ page }) => {
            // Open chat
            await page.locator('button[aria-label="Open AI Shopping Assistant"]').click();

            // The send button should be disabled initially
            const sendButton = page.locator('button[type="submit"]');
            await expect(sendButton).toBeDisabled();

            // Type spaces and verify it stays disabled
            await page.fill('input[placeholder="Ask about products..."]', '   ');
            await expect(sendButton).toBeDisabled();
        });

        test('AI-P03: Send message gets AI response', async ({ page }) => {
            // Note: This test requires the Ollama backend to be running to pass completely.
            // We will mock the API response here if we want a deterministic test, but for full E2E, 
            // we allow it to hit the real backend if running, or we just test the UI interaction.
            await page.route('**/api/v1/ai/chat', async route => {
                const json = {
                    conversationId: 999,
                    response: "This is a mocked AI response for testing."
                };
                await route.fulfill({ json });
            });

            await page.locator('button[aria-label="Open AI Shopping Assistant"]').click();

            const input = page.locator('input[placeholder="Ask about products..."]');
            await input.fill('Do you have electronics?');
            await page.locator('button[type="submit"]').click();

            // Verify user message appears in list
            await expect(page.getByText('Do you have electronics?')).toBeVisible();

            // Verify mocked AI response appears
            await expect(page.getByText('This is a mocked AI response for testing.')).toBeVisible();
        });

        test('AI-P04: Close and reopen preserves chat', async ({ page }) => {
            // Mock response
            await page.route('**/api/v1/ai/chat', async route => {
                const json = {
                    conversationId: 999,
                    response: "Mocked response."
                };
                await route.fulfill({ json });
            });

            // Open, send message
            await page.locator('button[aria-label="Open AI Shopping Assistant"]').click();
            await page.fill('input[placeholder="Ask about products..."]', 'Hello');
            await page.locator('button[type="submit"]').click();

            // Wait for response
            await expect(page.getByText('Mocked response.')).toBeVisible();

            // Close the chat
            // Close button is inside the header, next to the title
            await page.locator('button[title="New Conversation"]').locator('..').locator('button').nth(1).click();

            // Bubble should be visible again
            await expect(page.locator('button[aria-label="Open AI Shopping Assistant"]')).toBeVisible();

            // Open again
            await page.locator('button[aria-label="Open AI Shopping Assistant"]').click();

            // Messages should still be there
            await expect(page.getByText('Hello')).toBeVisible();
            await expect(page.getByText('Mocked response.')).toBeVisible();
        });
    });

});
