import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleAdminDashboardComponent } from './admin-dashboard.component';
import { AdminService } from '../../../services/admin.service';
import { of, throwError } from 'rxjs';

describe('SimpleAdminDashboardComponent', () => {
    let component: SimpleAdminDashboardComponent;
    let fixture: ComponentFixture<SimpleAdminDashboardComponent>;
    let adminService: jasmine.SpyObj<AdminService>;

    beforeEach(async () => {
        const adminSpy = jasmine.createSpyObj('AdminService', [
            'getDashboardStats', 'getSystemStats', 'getUserStats', 'getGroupStats', 'getChannelStats', 'getServerHealth', 'getAdminActivity'
        ]);

        await TestBed.configureTestingModule({
            imports: [SimpleAdminDashboardComponent, HttpClientTestingModule],
            providers: [
                { provide: AdminService, useValue: adminSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SimpleAdminDashboardComponent);
        component = fixture.componentInstance;
        adminService = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load dashboard stats on init', () => {
        const mockStats = {
            totalUsers: 100,
            totalGroups: 25,
            totalChannels: 150,
            totalMessages: 5000,
            activeUsers: 45,
            newUsersToday: 5,
            newUsersThisWeek: 15,
            messagesToday: 200,
            messagesThisWeek: 1200
        };
        const mockSystemStats = {
            serverUptime: '24h',
            memoryUsage: 75,
            cpuUsage: 45,
            diskUsage: 60,
            activeConnections: 150
        };
        const mockGroupStats = {
            totalGroups: 25,
            activeGroups: 20,
            privateGroups: 15,
            publicGroups: 10,
            averageMembersPerGroup: 8
        };
        const mockChannelStats = {
            totalChannels: 150,
            activeChannels: 120,
            textChannels: 100,
            voiceChannels: 50,
            videoChannels: 30,
            averageMessagesPerChannel: 25,
            mostActiveChannel: 'general'
        };
        const mockUserStats = {
            totalUsers: 100,
            activeUsers: 80,
            newUsersThisWeek: 15,
            superAdmins: 2,
            groupAdmins: 10,
            inactiveUsers: 20
        };

        adminService.getDashboardStats.and.returnValue(of({ success: true, data: mockStats }));
        adminService.getSystemStats.and.returnValue(of({ success: true, data: mockSystemStats }));
        adminService.getGroupStats.and.returnValue(of({ success: true, data: mockGroupStats }));
        adminService.getChannelStats.and.returnValue(of({ success: true, data: mockChannelStats }));
        adminService.getUserStats.and.returnValue(of({ success: true, data: mockUserStats }));
        adminService.getServerHealth.and.returnValue(of({
            success: true,
            data: {
                status: 'healthy' as const,
                checks: {
                    database: true,
                    redis: true,
                    storage: true,
                    memory: true
                },
                uptime: '24h',
                version: '1.0.0'
            }
        }));
        adminService.getAdminActivity.and.returnValue(of({ success: true, data: [] }));

        component.ngOnInit();

        expect(adminService.getDashboardStats).toHaveBeenCalled();
    });

    it('should handle loading states', () => {
        const mockStats = {
            totalUsers: 0,
            totalGroups: 0,
            totalChannels: 0,
            totalMessages: 0,
            activeUsers: 0,
            newUsersToday: 0,
            newUsersThisWeek: 0,
            messagesToday: 0,
            messagesThisWeek: 0
        };
        const mockSystemStats = {
            serverUptime: '0h',
            memoryUsage: 0,
            cpuUsage: 0,
            diskUsage: 0,
            activeConnections: 0
        };
        const mockGroupStats = {
            totalGroups: 0,
            activeGroups: 0,
            privateGroups: 0,
            publicGroups: 0,
            averageMembersPerGroup: 0
        };
        const mockChannelStats = {
            totalChannels: 0,
            activeChannels: 0,
            textChannels: 0,
            voiceChannels: 0,
            videoChannels: 0,
            averageMessagesPerChannel: 0,
            mostActiveChannel: ''
        };
        const mockUserStats = {
            totalUsers: 0,
            activeUsers: 0,
            newUsersThisWeek: 0,
            superAdmins: 0,
            groupAdmins: 0,
            inactiveUsers: 0
        };

        adminService.getDashboardStats.and.returnValue(of({ success: true, data: mockStats }));
        adminService.getSystemStats.and.returnValue(of({ success: true, data: mockSystemStats }));
        adminService.getGroupStats.and.returnValue(of({ success: true, data: mockGroupStats }));
        adminService.getChannelStats.and.returnValue(of({ success: true, data: mockChannelStats }));
        adminService.getUserStats.and.returnValue(of({ success: true, data: mockUserStats }));
        adminService.getServerHealth.and.returnValue(of({
            success: true,
            data: {
                status: 'healthy' as const,
                checks: {
                    database: true,
                    redis: true,
                    storage: true,
                    memory: true
                },
                uptime: '24h',
                version: '1.0.0'
            }
        }));
        adminService.getAdminActivity.and.returnValue(of({ success: true, data: [] }));

        component.ngOnInit();

        expect(component.isLoading).toBe(true);
    });

    it('should handle error states', () => {
        const mockSystemStats = {
            serverUptime: '0h',
            memoryUsage: 0,
            cpuUsage: 0,
            diskUsage: 0,
            activeConnections: 0
        };
        const mockGroupStats = {
            totalGroups: 0,
            activeGroups: 0,
            privateGroups: 0,
            publicGroups: 0,
            averageMembersPerGroup: 0
        };
        const mockChannelStats = {
            totalChannels: 0,
            activeChannels: 0,
            textChannels: 0,
            voiceChannels: 0,
            videoChannels: 0,
            averageMessagesPerChannel: 0,
            mostActiveChannel: ''
        };
        const mockUserStats = {
            totalUsers: 0,
            activeUsers: 0,
            newUsersThisWeek: 0,
            superAdmins: 0,
            groupAdmins: 0,
            inactiveUsers: 0
        };

        adminService.getDashboardStats.and.returnValue(throwError('Network error'));
        adminService.getSystemStats.and.returnValue(of({ success: true, data: mockSystemStats }));
        adminService.getGroupStats.and.returnValue(of({ success: true, data: mockGroupStats }));
        adminService.getChannelStats.and.returnValue(of({ success: true, data: mockChannelStats }));
        adminService.getUserStats.and.returnValue(of({ success: true, data: mockUserStats }));
        adminService.getServerHealth.and.returnValue(of({
            success: true,
            data: {
                status: 'healthy' as const,
                checks: {
                    database: true,
                    redis: true,
                    storage: true,
                    memory: true
                },
                uptime: '24h',
                version: '1.0.0'
            }
        }));
        adminService.getAdminActivity.and.returnValue(of({ success: true, data: [] }));

        component.ngOnInit();

        expect(component.isLoading).toBe(true);
    });
});
