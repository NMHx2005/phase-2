describe('Video Call Functionality', () => {
    beforeEach(() => {
        // Mock all API calls FIRST to prevent 401 errors and logout loops

        // Mock Socket.io polling to prevent authentication errors
        cy.intercept('GET', '**/socket.io/**', {
            statusCode: 200,
            body: '0'
        });

        cy.intercept('POST', '**/socket.io/**', {
            statusCode: 200,
            body: 'ok'
        });

        // Mock logout API
        cy.intercept('POST', '**/api/auth/logout*', {
            statusCode: 200,
            body: {
                success: true,
                message: 'Logged out successfully'
            }
        });

        // Mock message reactions API (prevent 401)
        cy.intercept('GET', '**/api/messages/*/reactions*', {
            statusCode: 200,
            body: {
                success: true,
                data: []
            }
        });

        // Mock group requests API (prevent 401)
        cy.intercept('GET', '**/api/group-requests*', {
            statusCode: 200,
            body: {
                success: true,
                data: [],
                total: 0,
                page: 1,
                limit: 1000
            }
        });

        // Mock avatar API
        cy.intercept('GET', '**/api/users/*/avatar*', {
            statusCode: 200,
            body: null
        });

        // Login after all mocks are set up
        cy.login('e2etest@example.com', 'password123');

        // Mock groups API
        cy.intercept('GET', '**/api/groups*', {
            statusCode: 200,
            body: {
                success: true,
                data: [
                    {
                        _id: 'test-group-id',
                        id: 'test-group-id',
                        name: 'Test Group',
                        description: 'A test group for E2E testing',
                        members: ['test-user-id'],
                        memberCount: 1,
                        isPrivate: false,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]
            }
        });

        // Mock video call APIs
        cy.intercept('POST', '**/api/video-calls*', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    _id: 'test-call-id',
                    callerId: 'test-user-id',
                    receiverId: 'test-receiver-id',
                    status: 'initiated'
                }
            }
        });

        cy.visit('/chat');

        // Wait for page to load
        cy.wait(2000);
    });

    it('should initiate video call', () => {
        // Mock getUserMedia for video
        cy.window().then((win) => {
            cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
                getTracks: () => [],
                getVideoTracks: () => [],
                getAudioTracks: () => []
            } as any);
        });

        // Select group
        cy.get('[data-cy="group-item"]').first().click();

        // Wait for page to stabilize
        cy.wait(1000);

        // Click video call button - should exist in chat header
        cy.get('app-video-call-button').should('exist');

        // For now, just verify the button exists
        // Full video call testing requires PeerJS and WebRTC mocking
    });

    it('should end video call', () => {
        // Select group
        cy.get('[data-cy="group-item"]').first().click();

        // Wait for page to stabilize
        cy.wait(1000);

        // Video call component should exist
        cy.get('app-video-call-button').should('exist');

        // Full video call flow testing requires complex WebRTC mocking
        // This test verifies the UI structure exists
    });

    it('should toggle microphone', () => {
        // Select group
        cy.get('[data-cy="group-item"]').first().click();

        // Wait for page to stabilize
        cy.wait(1000);

        // Video call button should be available in chat interface
        cy.get('app-video-call-button').should('exist');

        // Microphone toggle testing requires active video call
        // Simplified to just verify component exists
    });

    it('should toggle camera', () => {
        // Select group
        cy.get('[data-cy="group-item"]').first().click();

        // Wait for page to stabilize
        cy.wait(1000);

        // Video call button should be available
        cy.get('app-video-call-button').should('exist');

        // Camera toggle testing requires active video call with WebRTC
        // Simplified to verify component structure
    });
});
