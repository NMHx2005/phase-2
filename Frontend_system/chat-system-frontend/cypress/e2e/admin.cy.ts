describe('Admin Functionality', () => {
    // Helper function to create valid JWT token and set user data
    const setupValidUserSession = () => {
        const createMockJWT = () => {
            const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
            const payload = btoa(JSON.stringify({
                sub: 'admin-user-id',
                exp: Math.floor(Date.now() / 1000) + (60 * 60),
                iat: Math.floor(Date.now() / 1000)
            }));
            const signature = btoa('mock-signature');
            return `${header}.${payload}.${signature}`;
        };

        cy.window().then((win) => {
            const validToken = createMockJWT();
            const userData = {
                id: 'admin-user-id',
                username: 'superadmin',
                email: 'superadmin@chat-system.com',
                token: validToken,
                roles: ['super_admin', 'group_admin', 'user'],
                groups: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                isActive: true
            };

            win.localStorage.setItem('current_user', JSON.stringify(userData));
            win.localStorage.setItem('auth_token', validToken);
        });
    };

    beforeEach(() => {
        // Setup all API mocks BEFORE login
        // Login API mock - Match AuthService expectation
        cy.intercept('POST', '/api/auth/login', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    user: {
                        _id: 'admin-user-id',
                        username: 'superadmin',
                        email: 'superadmin@chat-system.com',
                        roles: ['super_admin', 'group_admin', 'user'],
                        groups: [],
                        isActive: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    },
                    accessToken: 'mock-admin-token',
                    refreshToken: 'mock-admin-refresh-token'
                }
            }
        }).as('loginRequest');


        // Admin dashboard APIs - CRITICAL: Must be BEFORE cy.login
        cy.intercept('GET', '/api/admin/dashboard', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    totalUsers: 100,
                    totalGroups: 10,
                    totalChannels: 25,
                    totalMessages: 1000,
                    newUsersThisWeek: 5,
                    messagesToday: 50
                }
            }
        }).as('adminDashboard');

        cy.intercept('GET', '/api/admin/stats', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    totalUsers: 100,
                    totalGroups: 10,
                    totalChannels: 25,
                    totalMessages: 1000,
                    newUsersThisWeek: 5,
                    messagesToday: 50
                }
            }
        }).as('adminStats');

        cy.intercept('GET', '/api/admin/groups/stats', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    activeGroups: 8,
                    totalGroups: 10,
                    newGroupsThisWeek: 2
                }
            }
        }).as('adminGroupsStats');

        cy.intercept('GET', '/api/admin/channels/stats', {
            statusCode: 200,
            body: {
                success: true,
                data: {
                    activeChannels: 20,
                    totalChannels: 25,
                    newChannelsThisWeek: 3
                }
            }
        }).as('adminChannelsStats');

        cy.login('superadmin', 'password123');

        // Debug: Wait for login to complete and check user data
        cy.window().its('localStorage').should('contain.key', 'auth_token');
        cy.window().its('localStorage').should('contain.key', 'current_user');

        // Ensure user is loaded properly in AuthService
        cy.window().then((win) => {
            // Force reload user from localStorage
            const userData = win.localStorage.getItem('current_user');
            if (userData) {
                const user = JSON.parse(userData);
                console.log('Cypress: Loaded user from localStorage:', user);

                // Force trigger AuthService to reload user
                win.dispatchEvent(new Event('storage'));
            }

            // Add console log listener to capture Angular logs
            const originalLog = win.console.log;
            win.console.log = (...args) => {
                if (args[0] && typeof args[0] === 'string' &&
                    (args[0].includes('🔍') || args[0].includes('RoleGuard'))) {
                    console.log('Cypress: Angular Log:', ...args);
                }
                originalLog.apply(win.console, args);
            };
        });

        // Mock admin APIs
        cy.interceptAPI('GET', '/api/users', {
            success: true,
            data: {
                users: [
                    {
                        _id: 'user1',
                        username: 'user1',
                        email: 'user1@example.com',
                        roles: ['user'],
                        isActive: true
                    }
                ],
                total: 1,
                page: 1,
                limit: 10
            }
        });

        cy.interceptAPI('GET', '/api/groups', {
            success: true,
            data: {
                groups: [
                    {
                        _id: 'group1',
                        name: 'Test Group',
                        description: 'A test group',
                        members: ['user1'],
                        isActive: true
                    }
                ],
                total: 1,
                page: 1,
                limit: 10
            }
        });
    });

    it('should display admin dashboard', () => {
        // Setup valid user session
        setupValidUserSession();

        // Visit login page first to restore session
        cy.visit('/login');
        cy.wait(1000);

        // Check if session was restored
        cy.window().then((win) => {
            console.log('Cypress: localStorage after login visit:', {
                current_user: win.localStorage.getItem('current_user'),
                auth_token: win.localStorage.getItem('auth_token')
            });
        });

        // Now visit admin page
        cy.visit('/admin');
        cy.wait(3000);

        // Check final state
        cy.window().then((win) => {
            console.log('Cypress: Current URL after admin visit:', win.location.href);
            console.log('Cypress: localStorage after admin visit:', {
                current_user: win.localStorage.getItem('current_user'),
                auth_token: win.localStorage.getItem('auth_token')
            });
        });

        cy.url().should('include', '/admin');
        cy.get('[data-cy="admin-dashboard"]').should('be.visible');
        cy.get('[data-cy="dashboard-stats"]').should('be.visible');
        cy.get('[data-cy="total-users"]').should('be.visible');
        cy.get('[data-cy="total-groups"]').should('be.visible');
    });

    it('should manage users', () => {
        // Setup valid user session
        setupValidUserSession();

        // Visit login page first to restore session
        cy.visit('/login');
        cy.wait(1000);

        // Now visit admin page
        cy.visit('/admin');
        cy.wait(2000);

        // Debug: Check what elements are actually in the DOM
        cy.get('body').then(($body) => {
            console.log('Cypress: DOM elements:', {
                hasAdminDashboard: $body.find('[data-cy="admin-dashboard"]').length,
                hasLoadingContainer: $body.find('.loading-container').length,
                hasDashboardContent: $body.find('.dashboard-content').length,
                hasMatTabGroup: $body.find('mat-tab-group').length,
                hasUsersTab: $body.find('[data-cy="users-tab"]').length,
                hasGroupsTab: $body.find('[data-cy="groups-tab"]').length,
                hasStatsTab: $body.find('[data-cy="stats-tab"]').length,
                allMatTabs: $body.find('mat-tab').length,
                bodyHTML: $body.html().substring(0, 1000) // First 1000 chars
            });
        });

        // Wait for loading to complete
        cy.get('.loading-container', { timeout: 5000 }).should('not.exist');

        // Check if admin dashboard exists
        cy.get('[data-cy="admin-dashboard"]').should('be.visible');

        // Wait a bit more for tabs to render
        cy.wait(2000);

        // Fix CSS overflow issue by scrolling to make tabs visible
        cy.get('mat-tab-group').scrollIntoView().should('be.visible');

        // Check if any mat-tab exists - use .mdc-tab instead of mat-tab
        cy.get('.mdc-tab').should('have.length.at.least', 1);

        // Try to find tabs by different selectors
        cy.get('.mdc-tab').then(($tabs) => {
            console.log('Cypress: Found tabs:', $tabs.length);
            $tabs.each((index, tab) => {
                console.log(`Tab ${index}:`, tab.textContent, tab.getAttribute('data-cy'));
            });
        });

        // Try clicking tab by text content - use .mdc-tab
        cy.get('.mdc-tab').contains('User Activity').scrollIntoView().click();
        cy.get('[data-cy="users-table"]').should('be.visible');

        // Should see existing users
        cy.get('[data-cy="user-row"]').should('contain', 'user1');

        // Should be able to create new user
        cy.get('[data-cy="create-user-button"]').click();

        cy.interceptAPI('POST', '/api/users', {
            success: true,
            data: {
                _id: 'new-user-id',
                username: 'newuser',
                email: 'newuser@example.com',
                roles: ['user']
            }
        });

        cy.get('[data-cy="user-username-input"]').type('newuser');
        cy.get('[data-cy="user-email-input"]').type('newuser@example.com');
        cy.get('[data-cy="user-password-input"]').type('password123');
        cy.get('[data-cy="create-user-submit"]').click();

        // Should see new user in table
        cy.get('[data-cy="user-row"]').should('contain', 'newuser');
    });

    it('should manage groups', () => {
        // Setup valid user session
        setupValidUserSession();

        // Visit login page first to restore session
        cy.visit('/login');
        cy.wait(1000);

        // Now visit admin page
        cy.visit('/admin');
        cy.wait(2000);

        // Wait for loading to complete
        cy.get('.loading-container', { timeout: 5000 }).should('not.exist');
        cy.get('[data-cy="admin-dashboard"]').should('be.visible');
        cy.wait(2000);

        // Fix CSS overflow issue by scrolling to make tabs visible
        cy.get('mat-tab-group').scrollIntoView().should('be.visible');

        // Try clicking tab by text content - use .mdc-tab
        cy.get('.mdc-tab').contains('Quick Actions').scrollIntoView().click();
        cy.get('[data-cy="groups-table"]').should('be.visible');

        // Should see existing groups
        cy.get('[data-cy="group-row"]').should('contain', 'Test Group');

        // Should be able to edit group
        cy.get('[data-cy="edit-group-button"]').first().click();

        cy.interceptAPI('PUT', '/api/groups/*', {
            success: true,
            data: {
                _id: 'group1',
                name: 'Updated Group Name',
                description: 'A test group'
            }
        });

        cy.get('[data-cy="group-name-input"]').clear().type('Updated Group Name');
        cy.get('[data-cy="update-group-submit"]').click();

        // Should see updated name
        cy.get('[data-cy="group-row"]').should('contain', 'Updated Group Name');
    });

    it('should view system statistics', () => {
        // Setup valid user session
        setupValidUserSession();

        // Visit login page first to restore session
        cy.visit('/login');
        cy.wait(1000);

        // Now visit admin page
        cy.visit('/admin');
        cy.wait(2000);

        // Wait for loading to complete
        cy.get('.loading-container', { timeout: 5000 }).should('not.exist');
        cy.get('[data-cy="admin-dashboard"]').should('be.visible');
        cy.wait(2000);

        // Fix CSS overflow issue by scrolling to make tabs visible
        cy.get('mat-tab-group').scrollIntoView().should('be.visible');

        // Try clicking tab by text content - use .mdc-tab
        cy.get('.mdc-tab').contains('System Overview').scrollIntoView().click();
        cy.get('[data-cy="system-stats"]').should('be.visible');

        // Should display various statistics
        cy.get('[data-cy="user-stats"]').should('be.visible');
        cy.get('[data-cy="group-stats"]').should('be.visible');
        cy.get('[data-cy="message-stats"]').should('be.visible');
    });

    it('should handle user permissions', () => {
        // Setup valid user session
        setupValidUserSession();

        // Visit login page first to restore session
        cy.visit('/login');
        cy.wait(1000);

        // Now visit admin page
        cy.visit('/admin');
        cy.wait(2000);

        // Wait for loading to complete
        cy.get('.loading-container', { timeout: 5000 }).should('not.exist');
        cy.get('[data-cy="admin-dashboard"]').should('be.visible');
        cy.wait(2000);

        // Fix CSS overflow issue by scrolling to make tabs visible
        cy.get('mat-tab-group').scrollIntoView().should('be.visible');

        // Try clicking tab by text content - use .mdc-tab
        cy.get('.mdc-tab').contains('User Activity').scrollIntoView().click();

        // Should be able to change user roles
        cy.get('[data-cy="user-role-select"]').first().select('group_admin');

        cy.interceptAPI('PUT', '/api/users/*', {
            success: true,
            data: {
                _id: 'user1',
                username: 'user1',
                email: 'user1@example.com',
                roles: ['group_admin']
            }
        });

        cy.get('[data-cy="update-user-button"]').first().click();

        // Should see updated role
        cy.get('[data-cy="user-role"]').should('contain', 'group_admin');
    });
});
