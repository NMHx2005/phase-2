describe('Advanced Chat System E2E Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    describe('User Authentication Flow', () => {
        it('should complete full registration and login flow', () => {
            // Register new user
            cy.get('[data-cy="register-tab"]').click();
            cy.get('[data-cy="username-input"]').type('e2etestuser');
            cy.get('[data-cy="email-input"]').type('e2etest@example.com');
            cy.get('[data-cy="password-input"]').type('password123');
            cy.get('[data-cy="confirm-password-input"]').type('password123');
            cy.get('[data-cy="register-button"]').click();

            // Should redirect to login or show success message
            cy.url().should('include', '/login');
            cy.get('[data-cy="success-message"]').should('be.visible');

            // Login with new credentials
            cy.get('[data-cy="email-input"]').type('e2etest@example.com');
            cy.get('[data-cy="password-input"]').type('password123');
            cy.get('[data-cy="login-button"]').click();

            // Should redirect to dashboard
            cy.url().should('include', '/dashboard');
            cy.get('[data-cy="user-menu"]').should('be.visible');
        });

        it('should handle login errors gracefully', () => {
            cy.get('[data-cy="email-input"]').type('invalid@example.com');
            cy.get('[data-cy="password-input"]').type('wrongpassword');
            cy.get('[data-cy="login-button"]').click();

            cy.get('[data-cy="error-message"]').should('be.visible');
            cy.get('[data-cy="error-message"]').should('contain', 'Invalid credentials');
        });
    });

    describe('Group Management', () => {
        beforeEach(() => {
            // Login first
            cy.login('test@example.com', 'password123');
        });

        it('should create and manage groups', () => {
            // Create new group
            cy.get('[data-cy="create-group-button"]').click();
            cy.get('[data-cy="group-name-input"]').type('E2E Test Group');
            cy.get('[data-cy="group-description-input"]').type('Group for E2E testing');
            cy.get('[data-cy="group-privacy-toggle"]').click(); // Make it private
            cy.get('[data-cy="create-group-submit"]').click();

            // Verify group was created
            cy.get('[data-cy="group-list"]').should('contain', 'E2E Test Group');
            cy.get('[data-cy="group-item"]').first().click();

            // Should navigate to group details
            cy.url().should('include', '/groups/');
            cy.get('[data-cy="group-name"]').should('contain', 'E2E Test Group');
            cy.get('[data-cy="group-description"]').should('contain', 'Group for E2E testing');
        });

        it('should join and leave groups', () => {
            // Find a public group to join
            cy.get('[data-cy="group-item"]').first().click();
            cy.get('[data-cy="join-group-button"]').click();

            // Verify joined
            cy.get('[data-cy="leave-group-button"]').should('be.visible');
            cy.get('[data-cy="group-members"]').should('contain', 'You');

            // Leave group
            cy.get('[data-cy="leave-group-button"]').click();
            cy.get('[data-cy="join-group-button"]').should('be.visible');
        });
    });

    describe('Channel and Messaging', () => {
        beforeEach(() => {
            cy.login('test@example.com', 'password123');
            // Navigate to a group
            cy.get('[data-cy="group-item"]').first().click();
        });

        it('should create channels and send messages', () => {
            // Create new channel
            cy.get('[data-cy="create-channel-button"]').click();
            cy.get('[data-cy="channel-name-input"]').type('e2e-test-channel');
            cy.get('[data-cy="channel-description-input"]').type('Channel for E2E testing');
            cy.get('[data-cy="channel-type-select"]').select('text');
            cy.get('[data-cy="create-channel-submit"]').click();

            // Verify channel was created
            cy.get('[data-cy="channel-list"]').should('contain', 'e2e-test-channel');
            cy.get('[data-cy="channel-item"]').contains('e2e-test-channel').click();

            // Send a message
            cy.get('[data-cy="message-input"]').type('Hello from E2E test!');
            cy.get('[data-cy="send-message-button"]').click();

            // Verify message was sent
            cy.get('[data-cy="message-list"]').should('contain', 'Hello from E2E test!');
            cy.get('[data-cy="message-item"]').last().should('contain', 'Hello from E2E test!');
        });

        it('should handle file uploads', () => {
            // Navigate to a channel
            cy.get('[data-cy="channel-item"]').first().click();

            // Upload a file
            const fileName = 'test-file.txt';
            cy.fixture('test-file.txt').then(fileContent => {
                cy.get('[data-cy="file-upload-input"]').selectFile({
                    contents: fileContent,
                    fileName: fileName,
                    mimeType: 'text/plain'
                });
            });

            // Verify file was uploaded
            cy.get('[data-cy="message-list"]').should('contain', fileName);
            cy.get('[data-cy="file-message"]').should('be.visible');
        });

        it('should handle message reactions', () => {
            // Navigate to a channel
            cy.get('[data-cy="channel-item"]').first().click();

            // Send a message
            cy.get('[data-cy="message-input"]').type('Test message for reactions');
            cy.get('[data-cy="send-message-button"]').click();

            // Add reaction
            cy.get('[data-cy="message-item"]').last().within(() => {
                cy.get('[data-cy="reaction-button"]').click();
                cy.get('[data-cy="emoji-picker"]').should('be.visible');
                cy.get('[data-cy="emoji-option"]').contains('👍').click();
            });

            // Verify reaction was added
            cy.get('[data-cy="message-reactions"]').should('contain', '👍');
            cy.get('[data-cy="reaction-count"]').should('contain', '1');
        });
    });

    describe('Real-time Features', () => {
        beforeEach(() => {
            cy.login('test@example.com', 'password123');
        });

        it('should show typing indicators', () => {
            // Open two browser windows (simulate two users)
            cy.window().then((win) => {
                // Simulate typing in another window
                win.dispatchEvent(new CustomEvent('user-typing', {
                    detail: { userId: 'other-user', username: 'Other User' }
                }));
            });

            // Verify typing indicator appears
            cy.get('[data-cy="typing-indicator"]').should('be.visible');
            cy.get('[data-cy="typing-indicator"]').should('contain', 'Other User is typing...');
        });

        it('should show online/offline status', () => {
            // Check user status
            cy.get('[data-cy="user-status"]').should('contain', 'Online');

            // Simulate going offline
            cy.window().then((win) => {
                win.dispatchEvent(new Event('offline'));
            });

            // Verify status changed
            cy.get('[data-cy="user-status"]').should('contain', 'Offline');
        });
    });

    describe('Video Call Integration', () => {
        beforeEach(() => {
            cy.login('test@example.com', 'password123');
            cy.get('[data-cy="group-item"]').first().click();
            cy.get('[data-cy="channel-item"]').first().click();
        });

        it('should initiate video calls', () => {
            // Start video call
            cy.get('[data-cy="video-call-button"]').click();
            cy.get('[data-cy="video-call-modal"]').should('be.visible');

            // Check camera and microphone permissions
            cy.get('[data-cy="camera-toggle"]').should('be.visible');
            cy.get('[data-cy="microphone-toggle"]').should('be.visible');

            // Start call
            cy.get('[data-cy="start-call-button"]').click();

            // Verify call started
            cy.get('[data-cy="video-call-active"]').should('be.visible');
            cy.get('[data-cy="local-video"]').should('be.visible');
        });

        it('should handle call controls', () => {
            // Start video call
            cy.get('[data-cy="video-call-button"]').click();
            cy.get('[data-cy="start-call-button"]').click();

            // Test mute/unmute
            cy.get('[data-cy="microphone-toggle"]').click();
            cy.get('[data-cy="microphone-toggle"]').should('have.class', 'muted');

            // Test camera on/off
            cy.get('[data-cy="camera-toggle"]').click();
            cy.get('[data-cy="camera-toggle"]').should('have.class', 'camera-off');

            // Test screen sharing
            cy.get('[data-cy="screen-share-button"]').click();
            cy.get('[data-cy="screen-share-active"]').should('be.visible');

            // End call
            cy.get('[data-cy="end-call-button"]').click();
            cy.get('[data-cy="video-call-modal"]').should('not.be.visible');
        });
    });

    describe('Admin Features', () => {
        beforeEach(() => {
            cy.login('admin@example.com', 'admin123');
        });

        it('should access admin dashboard', () => {
            cy.get('[data-cy="admin-menu"]').click();
            cy.get('[data-cy="admin-dashboard"]').click();

            // Verify admin dashboard loads
            cy.url().should('include', '/admin/dashboard');
            cy.get('[data-cy="admin-stats"]').should('be.visible');
            cy.get('[data-cy="user-management"]').should('be.visible');
            cy.get('[data-cy="system-logs"]').should('be.visible');
        });

        it('should manage users', () => {
            cy.get('[data-cy="admin-menu"]').click();
            cy.get('[data-cy="user-management"]').click();

            // Create new user
            cy.get('[data-cy="create-user-button"]').click();
            cy.get('[data-cy="user-username-input"]').type('admin-created-user');
            cy.get('[data-cy="user-email-input"]').type('admin-created@example.com');
            cy.get('[data-cy="user-password-input"]').type('password123');
            cy.get('[data-cy="user-role-select"]').select('user');
            cy.get('[data-cy="create-user-submit"]').click();

            // Verify user was created
            cy.get('[data-cy="user-list"]').should('contain', 'admin-created-user');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle network errors gracefully', () => {
            // Simulate network failure
            cy.intercept('GET', '/api/groups', { forceNetworkError: true });

            cy.login('test@example.com', 'password123');

            // Should show error message
            cy.get('[data-cy="error-message"]').should('be.visible');
            cy.get('[data-cy="retry-button"]').should('be.visible');
        });

        it('should handle invalid URLs', () => {
            cy.visit('/invalid-url');
            cy.get('[data-cy="not-found"]').should('be.visible');
            cy.get('[data-cy="go-home-button"]').click();
            cy.url().should('eq', Cypress.config().baseUrl + '/');
        });

        it('should handle browser back/forward navigation', () => {
            cy.login('test@example.com', 'password123');
            cy.get('[data-cy="group-item"]').first().click();
            cy.url().should('include', '/groups/');

            // Go back
            cy.go('back');
            cy.url().should('not.include', '/groups/');

            // Go forward
            cy.go('forward');
            cy.url().should('include', '/groups/');
        });
    });

    describe('Performance and Accessibility', () => {
        it('should load pages quickly', () => {
            const startTime = Date.now();
            cy.visit('/');
            cy.get('[data-cy="login-form"]').should('be.visible');
            const loadTime = Date.now() - startTime;

            // Page should load within 3 seconds
            expect(loadTime).to.be.lessThan(3000);
        });

        it('should be keyboard accessible', () => {
            cy.visit('/');

            // Tab through form elements
            cy.get('body').tab();
            cy.focused().should('have.attr', 'data-cy', 'email-input');

            cy.focused().tab();
            cy.focused().should('have.attr', 'data-cy', 'password-input');

            cy.focused().tab();
            cy.focused().should('have.attr', 'data-cy', 'login-button');
        });

        it('should work with screen readers', () => {
            cy.visit('/');

            // Check for proper ARIA labels
            cy.get('[data-cy="email-input"]').should('have.attr', 'aria-label');
            cy.get('[data-cy="password-input"]').should('have.attr', 'aria-label');
            cy.get('[data-cy="login-button"]').should('have.attr', 'aria-label');
        });
    });
});
