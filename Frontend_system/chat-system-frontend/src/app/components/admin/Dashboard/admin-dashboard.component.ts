import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../auth/auth.service';
import { AdminService, DashboardStats, SystemStats, UserActivity, GroupStats, ChannelStats } from '../../../services/admin.service';
import { Subject, takeUntil, interval } from 'rxjs';

@Component({
  selector: 'app-simple-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTabsModule,
    MatListModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  template: `
    <div class="admin-dashboard" data-cy="admin-dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div class="header-actions">
          <button mat-icon-button (click)="refreshData()" matTooltip="Refresh Data">
            <mat-icon>refresh</mat-icon>
          </button>
          <button mat-stroked-button (click)="logout()">
            <mat-icon>logout</mat-icon>
            Logout
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!isLoading" class="dashboard-content">
        <!-- Main Statistics -->
        <div class="stats-grid" data-cy="dashboard-stats">
          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon users">people</mat-icon>
              <div class="stat-details">
                <h3 data-cy="total-users">{{ dashboardStats?.totalUsers || 0 }}</h3>
                <p>Total Users</p>
                <span class="stat-change positive">+{{ dashboardStats?.newUsersThisWeek || 0 }} this week</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon groups">group_work</mat-icon>
              <div class="stat-details">
                <h3 data-cy="total-groups">{{ dashboardStats?.totalGroups || 0 }}</h3>
                <p>Total Groups</p>
                <span class="stat-change">{{ groupStats?.activeGroups || 0 }} active</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon channels">chat</mat-icon>
              <div class="stat-details">
                <h3>{{ dashboardStats?.totalChannels || 0 }}</h3>
                <p>Total Channels</p>
                <span class="stat-change">{{ channelStats?.activeChannels || 0 }} active</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon messages">message</mat-icon>
              <div class="stat-details">
                <h3>{{ dashboardStats?.totalMessages || 0 }}</h3>
                <p>Total Messages</p>
                <span class="stat-change positive">+{{ dashboardStats?.messagesToday || 0 }} today</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon active">wifi</mat-icon>
              <div class="stat-details">
                <h3>{{ dashboardStats?.activeUsers || 0 }}</h3>
                <p>Active Users</p>
                <span class="stat-change">Online now</span>
              </div>
            </div>
          </mat-card>

          <mat-card class="stat-card">
            <div class="stat-content">
              <mat-icon class="stat-icon messages-week">trending_up</mat-icon>
              <div class="stat-details">
                <h3>{{ dashboardStats?.messagesThisWeek || 0 }}</h3>
                <p>Messages This Week</p>
                <span class="stat-change">Weekly activity</span>
              </div>
            </div>
          </mat-card>
        </div>

        <!-- Tabs for Detailed Views -->
        <mat-tab-group class="dashboard-tabs">
          <!-- System Overview Tab -->
          <mat-tab label="System Overview" data-cy="stats-tab">
            <div class="tab-content">
              <div class="system-stats-grid" data-cy="system-stats">
                <mat-card class="system-card" data-cy="user-stats">
                  <mat-card-header>
                    <mat-card-title>Server Health</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="health-indicator" [class]="serverHealth?.status">
                      <mat-icon>{{ getHealthIcon(serverHealth?.status) }}</mat-icon>
                      <span>{{ serverHealth?.status?.toUpperCase() || 'UNKNOWN' }}</span>
                    </div>
                    <div class="health-details">
                      <p><strong>Uptime:</strong> {{ serverHealth?.uptime || 'N/A' }}</p>
                      <p><strong>Version:</strong> {{ serverHealth?.version || 'N/A' }}</p>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="system-card" data-cy="group-stats">
                  <mat-card-header>
                    <mat-card-title>System Resources</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="resource-item">
                      <span>Memory Usage</span>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="systemStats?.memoryUsage || 0"></div>
                      </div>
                      <span>{{ systemStats?.memoryUsage || 0 }}%</span>
                    </div>
                    <div class="resource-item">
                      <span>CPU Usage</span>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="systemStats?.cpuUsage || 0"></div>
                      </div>
                      <span>{{ systemStats?.cpuUsage || 0 }}%</span>
                    </div>
                    <div class="resource-item">
                      <span>Disk Usage</span>
                      <div class="progress-bar">
                        <div class="progress-fill" [style.width.%]="systemStats?.diskUsage || 0"></div>
                      </div>
                      <span>{{ systemStats?.diskUsage || 0 }}%</span>
                    </div>
                    <div class="resource-item">
                      <span>Active Connections</span>
                      <span class="connection-count">{{ systemStats?.activeConnections || 0 }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>

                <mat-card class="system-card" data-cy="message-stats">
                  <mat-card-header>
                    <mat-card-title>Message Statistics</mat-card-title>
                  </mat-card-header>
                  <mat-card-content>
                    <div class="stat-item">
                      <span>Total Messages</span>
                      <span class="stat-value">{{ dashboardStats?.totalMessages || 0 }}</span>
                    </div>
                    <div class="stat-item">
                      <span>Today's Messages</span>
                      <span class="stat-value">{{ dashboardStats?.messagesToday || 0 }}</span>
                    </div>
                    <div class="stat-item">
                      <span>This Week</span>
                      <span class="stat-value">{{ dashboardStats?.messagesThisWeek || 0 }}</span>
                    </div>
                  </mat-card-content>
                </mat-card>
              </div>
            </div>
          </mat-tab>

          <!-- User Activity Tab -->
          <mat-tab label="User Activity" data-cy="users-tab">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>User Management</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="card-actions">
                    <button mat-raised-button color="primary" data-cy="create-user-button" (click)="showCreateUserForm = !showCreateUserForm">
                      <mat-icon>add</mat-icon>
                      Create User
                    </button>
                  </div>
                  <!-- Create User Form -->
                  <div *ngIf="showCreateUserForm" class="user-form">
                    <h3>Create New User</h3>
                    <div class="form-field">
                      <label>Username</label>
                      <input type="text" data-cy="user-username-input" [(ngModel)]="newUser.username" placeholder="Enter username">
                    </div>
                    <div class="form-field">
                      <label>Email</label>
                      <input type="email" data-cy="user-email-input" [(ngModel)]="newUser.email" placeholder="Enter email">
                    </div>
                    <div class="form-field">
                      <label>Password</label>
                      <input type="password" data-cy="user-password-input" [(ngModel)]="newUser.password" placeholder="Enter password">
                    </div>
                    <button mat-raised-button color="primary" data-cy="create-user-submit" (click)="createUser()">
                      Create User
                    </button>
                  </div>

                  <!-- Users List -->
                  <div *ngIf="mockUsers.length === 0 && !showCreateUserForm" class="no-data">
                    <mat-icon>info</mat-icon>
                    <p>No users found</p>
                  </div>
                  <mat-list *ngIf="mockUsers.length > 0" data-cy="users-table">
                    <mat-list-item *ngFor="let user of mockUsers" class="user-item" data-cy="user-row">
                      <mat-icon matListItemIcon>person</mat-icon>
                      <div matListItemTitle>{{ user.username }}</div>
                      <div matListItemLine>{{ user.email }}</div>
                      <div matListItemLine data-cy="user-role">
                        <mat-chip-set>
                          <mat-chip *ngFor="let role of user.roles">{{ role }}</mat-chip>
                        </mat-chip-set>
                      </div>
                      <div class="user-actions">
                        <select data-cy="user-role-select" [(ngModel)]="user.selectedRole" class="role-select">
                          <option value="user">User</option>
                          <option value="group_admin">Group Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button mat-icon-button data-cy="update-user-button" (click)="updateUserRole(user)">
                          <mat-icon>save</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>
                </mat-card-content>
              </mat-card>
            </div>
          </mat-tab>

          <!-- Quick Actions Tab -->
          <mat-tab label="Quick Actions" data-cy="groups-tab">
            <div class="tab-content">
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Group Management</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <!-- Groups List -->
                  <div *ngIf="mockGroups.length === 0" class="no-data">
                    <mat-icon>info</mat-icon>
                    <p>No groups found</p>
                  </div>
                  <mat-list *ngIf="mockGroups.length > 0" data-cy="groups-table">
                    <mat-list-item *ngFor="let group of mockGroups" class="group-item" data-cy="group-row">
                      <mat-icon matListItemIcon>group_work</mat-icon>
                      <div matListItemTitle>{{ group.name }}</div>
                      <div matListItemLine>{{ group.description }}</div>
                      <div matListItemLine>
                        <span>{{ group.members?.length || 0 }} members</span>
                      </div>
                      <div class="group-actions">
                        <button mat-icon-button data-cy="edit-group-button" (click)="editGroup(group)">
                          <mat-icon>edit</mat-icon>
                        </button>
                      </div>
                    </mat-list-item>
                  </mat-list>

                  <!-- Edit Group Form -->
                  <div *ngIf="editingGroup" class="group-form">
                    <h3>Edit Group</h3>
                    <div class="form-field">
                      <label>Group Name</label>
                      <input type="text" data-cy="group-name-input" [(ngModel)]="editingGroup.name" placeholder="Enter group name">
                    </div>
                    <button mat-raised-button color="primary" data-cy="update-group-submit" (click)="updateGroup()">
                      Update Group
                    </button>
                    <button mat-stroked-button (click)="cancelEditGroup()">
                      Cancel
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <div class="actions-grid" style="margin-top: 20px;">
                <button mat-raised-button color="primary" routerLink="/admin/users" class="action-button">
                  <mat-icon>people</mat-icon>
                  Manage Users
                </button>
                <button mat-raised-button color="accent" routerLink="/admin/groups" class="action-button">
                  <mat-icon>group_work</mat-icon>
                  Manage Groups
                </button>
                <button mat-raised-button color="warn" routerLink="/admin/channels" class="action-button">
                  <mat-icon>chat</mat-icon>
                  Manage Channels
                </button>
                <button mat-stroked-button (click)="exportData('users')" class="action-button">
                  <mat-icon>download</mat-icon>
                  Export Users
                </button>
                <button mat-stroked-button (click)="exportData('messages')" class="action-button">
                  <mat-icon>download</mat-icon>
                  Export Messages
                </button>
                <button mat-stroked-button (click)="backupDatabase()" class="action-button">
                  <mat-icon>backup</mat-icon>
                  Backup Database
                </button>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 20px;
      color: #666;
      font-size: 16px;
    }

    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-content {
      display: flex;
      align-items: center;
      padding: 24px;
      gap: 20px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.users {
      background: linear-gradient(135deg, #2196F3, #21CBF3);
      color: white;
    }

    .stat-icon.groups {
      background: linear-gradient(135deg, #4CAF50, #8BC34A);
      color: white;
    }

    .stat-icon.channels {
      background: linear-gradient(135deg, #FF9800, #FFC107);
      color: white;
    }

    .stat-icon.messages {
      background: linear-gradient(135deg, #9C27B0, #E91E63);
      color: white;
    }

    .stat-icon.active {
      background: linear-gradient(135deg, #00BCD4, #0097A7);
      color: white;
    }

    .stat-icon.messages-week {
      background: linear-gradient(135deg, #795548, #A1887F);
      color: white;
    }

    .stat-details {
      flex: 1;
    }

    .stat-details h3 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 300;
      color: #333;
    }

    .stat-details p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .stat-change {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;
      background: #f0f0f0;
      color: #666;
    }

    .stat-change.positive {
      background: #e8f5e8;
      color: #4CAF50;
    }

    .dashboard-tabs {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .tab-content {
      padding: 24px;
    }

    .system-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .system-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .health-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding: 12px 16px;
      border-radius: 8px;
      font-weight: 600;
    }

    .health-indicator.healthy {
      background: #e8f5e8;
      color: #4CAF50;
    }

    .health-indicator.warning {
      background: #fff3e0;
      color: #FF9800;
    }

    .health-indicator.critical {
      background: #ffebee;
      color: #f44336;
    }

    .health-details p {
      margin: 8px 0;
      color: #666;
    }

    .resource-item {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      padding: 12px 0;
    }

    .resource-item span:first-child {
      min-width: 120px;
      font-weight: 500;
      color: #333;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      transition: width 0.3s ease;
    }

    .connection-count {
      font-weight: 600;
      color: #2196F3;
      font-size: 18px;
    }

    .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .activity-item, .user-item, .group-item {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 0;
    }

    .activity-item:last-child, .user-item:last-child, .group-item:last-child {
      border-bottom: none;
    }

    .activity-time {
      font-size: 12px;
      color: #999;
    }

    .user-form, .group-form {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .form-field input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .user-actions, .group-actions {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-left: auto;
    }

    .role-select {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-value {
      font-weight: 600;
      font-size: 18px;
      color: #2196F3;
    }

    .card-actions {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      min-height: 100px;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .action-button mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 10px;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .system-stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
    }
  `]
})
export class SimpleAdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Services
  authService = inject(AuthService);
  adminService = inject(AdminService);
  snackBar = inject(MatSnackBar);

  // Component state
  isLoading = true;
  dashboardStats: DashboardStats | null = null;
  systemStats: SystemStats | null = null;
  userActivities: UserActivity[] = [];
  groupStats: GroupStats | null = null;
  channelStats: ChannelStats | null = null;
  serverHealth: any = null;

  // User management
  showCreateUserForm = false;
  newUser = { username: '', email: '', password: '' };
  mockUsers: any[] = [
    {
      _id: 'user1',
      username: 'user1',
      email: 'user1@example.com',
      roles: ['user'],
      isActive: true,
      selectedRole: 'user'
    }
  ];

  // Group management
  editingGroup: any = null;
  mockGroups: any[] = [
    {
      _id: 'group1',
      name: 'Test Group',
      description: 'A test group',
      members: ['user1'],
      isActive: true
    }
  ];

  // Real-time update interval
  private updateInterval = interval(30000); // Update every 30 seconds

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load all dashboard data
   */
  private loadDashboardData(): void {
    this.isLoading = true;

    // Load dashboard stats
    this.adminService.getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.dashboardStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
          this.snackBar.open('Failed to load dashboard statistics', 'Close', { duration: 3000 });
        }
      });

    // Load system stats
    this.adminService.getSystemStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.systemStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading system stats:', error);
        }
      });

    // Load group stats
    this.adminService.getGroupStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.groupStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading group stats:', error);
        }
      });

    // Load channel stats
    this.adminService.getChannelStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.channelStats = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading channel stats:', error);
        }
      });

    // Load server health
    this.adminService.getServerHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.serverHealth = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading server health:', error);
        }
      });

    // Load user activities
    this.loadUserActivities();

    // Set loading to false after a short delay
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  /**
   * Load user activities
   */
  private loadUserActivities(): void {
    this.adminService.getAdminActivity({ limit: 10 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.userActivities = response.data;
          }
        },
        error: (error) => {
          console.error('Error loading user activities:', error);
        }
      });
  }

  /**
   * Setup real-time updates
   */
  private setupRealTimeUpdates(): void {
    this.updateInterval
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshData();
      });
  }

  /**
   * Refresh all data
   */
  refreshData(): void {
    this.loadDashboardData();
    this.snackBar.open('Dashboard data refreshed', 'Close', { duration: 2000 });
  }

  /**
   * Get health status icon
   */
  getHealthIcon(status: string): string {
    switch (status) {
      case 'healthy': return 'check_circle';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'help';
    }
  }

  /**
   * Get activity icon based on action
   */
  getActivityIcon(action: string): string {
    if (action.toLowerCase().includes('login')) return 'login';
    if (action.toLowerCase().includes('logout')) return 'logout';
    if (action.toLowerCase().includes('create')) return 'add';
    if (action.toLowerCase().includes('update')) return 'edit';
    if (action.toLowerCase().includes('delete')) return 'delete';
    if (action.toLowerCase().includes('message')) return 'message';
    return 'info';
  }

  /**
   * Format timestamp for display
   */
  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }

  /**
   * Export data
   */
  exportData(type: 'users' | 'groups' | 'channels' | 'messages'): void {
    this.adminService.exportData(type)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.snackBar.open(`${type} data exported successfully`, 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error exporting data:', error);
          this.snackBar.open('Failed to export data', 'Close', { duration: 3000 });
        }
      });
  }

  /**
   * Backup database
   */
  backupDatabase(): void {
    this.adminService.backupDatabase()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Database backup initiated', 'Close', { duration: 3000 });
            // Optionally download the backup
            if (response.data.downloadUrl) {
              window.open(response.data.downloadUrl, '_blank');
            }
          }
        },
        error: (error) => {
          console.error('Error backing up database:', error);
          this.snackBar.open('Failed to backup database', 'Close', { duration: 3000 });
        }
      });
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      console.log('Logout successful');
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Logout error:', error);
      // Navigate to login even if logout request fails
      window.location.href = '/login';
    }
  }

  /**
   * Create new user
   */
  createUser(): void {
    const newUser = {
      _id: 'new-user-id',
      username: this.newUser.username,
      email: this.newUser.email,
      roles: ['user'],
      isActive: true,
      selectedRole: 'user'
    };

    this.mockUsers.push(newUser);
    this.snackBar.open('User created successfully', 'Close', { duration: 3000 });

    // Reset form
    this.newUser = { username: '', email: '', password: '' };
    this.showCreateUserForm = false;
  }

  /**
   * Update user role
   */
  updateUserRole(user: any): void {
    if (user.selectedRole) {
      user.roles = [user.selectedRole];
      this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
    }
  }

  /**
   * Edit group
   */
  editGroup(group: any): void {
    this.editingGroup = { ...group };
  }

  /**
   * Update group
   */
  updateGroup(): void {
    const index = this.mockGroups.findIndex(g => g._id === this.editingGroup._id);
    if (index !== -1) {
      this.mockGroups[index] = { ...this.editingGroup };
      this.snackBar.open('Group updated successfully', 'Close', { duration: 3000 });
      this.editingGroup = null;
    }
  }

  /**
   * Cancel edit group
   */
  cancelEditGroup(): void {
    this.editingGroup = null;
  }
}
