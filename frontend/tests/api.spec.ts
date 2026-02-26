import { test, expect } from '@playwright/test';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8081/api/v1';

test.describe('ShopEase Backend API Tests', () => {

    let authToken: string;

    test.beforeAll(async ({ request }) => {
        // Attempt to log in to get a token for protected routes
        const response = await request.post(`${API_URL}/auth/login`, {
            data: {
                email: 'testapi_user@shopease.com',
                password: 'Password123!'
            }
        });
        if (response.ok()) {
            const body = await response.json();
            authToken = body.token;
        }
    });

    test.describe('1. Authentication (/api/v1/auth)', () => {
        test('[API-AUTH-P01] Login with valid credentials', async ({ request }) => {
            const response = await request.post(`${API_URL}/auth/login`, {
                data: {
                    email: 'testapi_user@shopease.com',
                    password: 'Password123!'
                }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.token).toBeDefined();
        });

        test('[API-AUTH-N01] Login with invalid password', async ({ request }) => {
            const response = await request.post(`${API_URL}/auth/login`, {
                data: {
                    email: 'testapi_user@shopease.com',
                    password: 'WrongPassword!'
                }
            });
            // Depending on backend implementation, this is usually 401
            expect(response.status()).not.toBe(200);
        });

        test('[API-AUTH-P03] Get profile with valid token', async ({ request }) => {
            test.skip(!authToken, 'Auth token not available');
            const response = await request.get(`${API_URL}/auth/profile`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            expect(response.status()).toBe(200);
        });

        test('[API-AUTH-N03] Get profile without token', async ({ request }) => {
            const response = await request.get(`${API_URL}/auth/profile`);
            expect(response.status()).toBe(401);
        });
    });

    test.describe('2. Products (/api/v1/products)', () => {
        test('[API-PROD-P01] Get all paginated products', async ({ request }) => {
            const response = await request.get(`${API_URL}/products?page=0&size=5`);
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(body.content).toBeDefined();
            expect(Array.isArray(body.content)).toBeTruthy();
        });

        test('[API-PROD-N01] Get non-existent product', async ({ request }) => {
            const response = await request.get(`${API_URL}/products/999999`);
            expect(response.status()).toBe(404);
        });
    });

    test.describe('3. AI Assistant (/api/v1/ai)', () => {
        test('[API-AI-N01] Chat setup missing message body', async ({ request }) => {
            test.skip(!authToken, 'Auth token not available');
            const response = await request.post(`${API_URL}/ai/chat`, {
                headers: { Authorization: `Bearer ${authToken}` },
                data: {} // Empty body should trigger validation error
            });
            expect(response.status()).toBe(400);
        });

        test('[API-AI-P02] Get AI conversations', async ({ request }) => {
            test.skip(!authToken, 'Auth token not available');
            const response = await request.get(`${API_URL}/ai/conversations`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            expect(response.status()).toBe(200);
            const body = await response.json();
            expect(Array.isArray(body)).toBeTruthy();
        });
    });

});
