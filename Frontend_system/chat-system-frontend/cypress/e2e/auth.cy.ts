describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display login page by default', () => {
        cy.url().should('include', '/login');
        cy.get('[data-cy="login-form"]').should('be.visible');
        cy.get('[data-cy="email-input"]').should('be.visible');
        cy.get('[data-cy="password-input"]').should('be.visible');
        cy.get('[data-cy="login-button"]').should('be.visible');
    });

    it('should navigate to register page', () => {
        cy.get('[data-cy="register-link"]').click();
        cy.url().should('include', '/register');
        cy.get('[data-cy="register-form"]').should('be.visible');
    });

    it('should register a new user successfully', () => {
        cy.visit('/register');

        // Mock register API
        cy.interceptAPI('POST', '/api/auth/register', {
            success: true,
            data: {
                user: {
                    _id: 'new-user-id',
                    username: 'e2etestuser',
                    email: 'e2etest@example.com',
                    roles: ['user'],
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            }
        });

        // Mock logout API (called after successful registration)
        cy.interceptAPI('POST', '/api/auth/logout', {
            success: true,
            message: 'Logged out successfully'
        });

        cy.get('[data-cy="username-input"]').type('e2etestuser');
        cy.get('[data-cy="email-input"]').type('e2etest@example.com');
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="confirm-password-input"]').type('password123');

        cy.get('[data-cy="register-button"]').click();

        // Should redirect to login with success message
        cy.url().should('include', '/login');
        cy.get('[data-cy="success-message"]').should('be.visible');
    });

    it('should login with valid credentials', () => {
        cy.interceptAPI('POST', '/api/auth/login', {
            success: true,
            data: {
                user: {
                    _id: 'test-user-id',
                    username: 'e2etestuser',
                    email: 'e2etest@example.com',
                    roles: ['user']
                },
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            }
        });

        cy.get('[data-cy="email-input"]').type('e2etest@example.com');
        cy.get('[data-cy="password-input"]').type('password123');
        cy.get('[data-cy="login-button"]').click();

        cy.url().should('include', '/home');
        cy.get('[data-cy="user-menu"]').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
        cy.interceptAPI('POST', '/api/auth/login', {
            success: false,
            message: 'Invalid credentials'
        });

        cy.get('[data-cy="email-input"]').type('invalid@example.com');
        cy.get('[data-cy="password-input"]').type('wrongpassword');
        cy.get('[data-cy="login-button"]').click();

        cy.get('[data-cy="error-message"]').should('be.visible');
        cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
    });

    it('should validate required fields', () => {
        // Check that fields have required attribute
        cy.get('[data-cy="email-input"]').should('have.attr', 'required');
        cy.get('[data-cy="password-input"]').should('have.attr', 'required');

        // Check that login button is disabled when fields are empty
        cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should validate email format', () => {
        cy.get('[data-cy="email-input"]').type('invalid-email');
        cy.get('[data-cy="password-input"]').type('password123');

        // Button should be disabled due to invalid email
        cy.get('[data-cy="login-button"]').should('be.disabled');

        // Email input should have ng-invalid class
        cy.get('[data-cy="email-input"]').should('have.class', 'ng-invalid');
    });
});
