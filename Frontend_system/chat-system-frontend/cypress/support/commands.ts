/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare namespace Cypress {
    interface Chainable {
        /**
         * Custom command to login with test credentials
         * @example cy.login('test@example.com', 'password123')
         */
        login(email?: string, password?: string): Chainable<void>;

        /**
         * Custom command to logout
         * @example cy.logout()
         */
        logout(): Chainable<void>;

        /**
         * Custom command to create a test user
         * @example cy.createTestUser()
         */
        createTestUser(): Chainable<void>;

        /**
         * Custom command to wait for Angular to be ready
         * @example cy.waitForAngular()
         */
        waitForAngular(): Chainable<void>;

        /**
         * Custom command to intercept API calls
         * @example cy.interceptAPI('GET', '/api/users', { users: [] })
         */
        interceptAPI(method: string, url: string, response: any): Chainable<void>;
    }
}

// Custom command to login
Cypress.Commands.add('login', (username: string = 'superadmin', password: string = 'password123') => {
    cy.session([username, password], () => {
        // Determine roles based on username
        const roles = username === 'superadmin'
            ? ['super_admin', 'group_admin', 'user']
            : ['user'];

        // Create valid JWT tokens (header.payload.signature format)
        const userId = username === 'superadmin' ? 'admin-user-id' : 'test-user-id';
        const createMockJWT = (userId: string, exp: number) => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                sub: userId,
                username: username,
                roles: roles,
                exp: exp,
                iat: Math.floor(Date.now() / 1000)
            }));
            const signature = btoa('mock-signature-' + Math.random());
            return `${header}.${payload}.${signature}`;
        };

        const accessToken = createMockJWT(userId, Math.floor(Date.now() / 1000) + (60 * 60)); // expires in 1 hour
        const refreshToken = createMockJWT(userId, Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)); // expires in 7 days

        // Mock login API before visiting login page
        cy.intercept('POST', '**/api/auth/login', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    user: {
                        _id: userId,
                        username: username,
                        email: username,
                        roles: roles,
                        groups: [],
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    },
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
            }
        }).as('loginRequest');

        cy.visit('/login');
        cy.get('[data-cy="email-input"]').type(username);
        cy.get('[data-cy="password-input"]').type(password);
        cy.get('[data-cy="login-button"]').click();

        // Wait for login API call
        cy.wait('@loginRequest');

        // Wait for login to complete and redirect
        cy.url().should('not.include', '/login', { timeout: 10000 });

        // Wait a bit for Angular to process the login
        cy.wait(500);

        // Verify user is stored in localStorage
        cy.window().then((win) => {
            const authToken = win.localStorage.getItem('auth_token');
            const currentUser = win.localStorage.getItem('current_user');

            if (!authToken || !currentUser) {
                throw new Error('Login failed: localStorage not populated correctly');
            }
        });
    });
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
    cy.get('[data-cy="logout-button"]').click();
    cy.url().should('include', '/login');
});

// Custom command to create test user
Cypress.Commands.add('createTestUser', () => {
    cy.visit('/register');
    cy.get('[data-cy="username-input"]').type('e2etestuser');
    cy.get('[data-cy="email-input"]').type('e2etest@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="confirm-password-input"]').type('password123');
    cy.get('[data-cy="register-button"]').click();
    cy.url().should('include', '/login');
});

// Custom command to wait for Angular
Cypress.Commands.add('waitForAngular', () => {
    cy.window().should('have.property', 'ng');
    cy.get('body').should('be.visible');
});

// Custom command to intercept API calls
Cypress.Commands.add('interceptAPI', (method: string, url: string, response: any) => {
    cy.intercept(method as any, url, response).as(`${method.toLowerCase()}_${url.replace(/\//g, '_')}`);
});
