// This is a sample spec file to demonstrate Cypress E2E testing
describe('Chat System - Sample E2E Test', () => {
    it('should load the application', () => {
        cy.visit('/');
        cy.url().should('include', '/login'); // Root redirects to login
        cy.get('[data-cy="login-form"]').should('be.visible');
    });

    it('should have login form', () => {
        cy.visit('/login');
        cy.get('[data-cy="login-form"]').should('exist');
        cy.get('[data-cy="email-input"]').should('exist');
        cy.get('[data-cy="password-input"]').should('exist');
        cy.get('[data-cy="login-button"]').should('exist');
    });
});
