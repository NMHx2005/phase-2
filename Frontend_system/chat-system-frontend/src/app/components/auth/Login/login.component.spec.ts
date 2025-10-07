import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../services/auth.service';
import { User, UserRole } from '../../../models/user.model';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;
    let activatedRoute: any;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: { queryParams: of({}), snapshot: { queryParams: {} } } }
            ]
        }).compileComponents();
    });

    it('should create', () => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(false);

        expect(component).toBeTruthy();
    });

    it('should redirect if user is already authenticated', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            roles: [UserRole.USER],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(true);
        spyOn(component['authService'], 'getCurrentUser').and.returnValue(mockUser);
        spyOn(component['authService'], 'isSuperAdmin').and.returnValue(false);
        spyOn(component['authService'], 'isGroupAdmin').and.returnValue(false);
        spyOn(component['router'], 'navigate');

        // Trigger ngOnInit by calling detectChanges
        fixture.detectChanges();

        expect(component['authService'].isAuthenticated).toHaveBeenCalled();
        expect(component['authService'].getCurrentUser).toHaveBeenCalled();
        expect(component['authService'].isSuperAdmin).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should show success message when coming from registration', () => {
        // Override ActivatedRoute with mock queryParams Observable
        const mockActivatedRoute = {
            queryParams: of({ registered: 'true' }),
            snapshot: { queryParams: {} }
        };

        TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRoute });

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(false);

        // Trigger ngOnInit by calling detectChanges
        fixture.detectChanges();

        expect(component.successMessage).toBe('Registration successful! Please sign in.');
    });

    it('should navigate to register', () => {
        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(false);
        spyOn(component['router'], 'navigate');

        component.navigateToRegister();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/register']);
    });

    it('should redirect admin users to admin panel', () => {
        const mockUser: User = {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            roles: [UserRole.SUPER_ADMIN],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(true);
        spyOn(component['authService'], 'getCurrentUser').and.returnValue(mockUser);
        spyOn(component['authService'], 'isSuperAdmin').and.returnValue(true);
        spyOn(component['authService'], 'isGroupAdmin').and.returnValue(false);
        spyOn(component['router'], 'navigate');

        // Trigger ngOnInit by calling detectChanges
        fixture.detectChanges();

        expect(component['authService'].isAuthenticated).toHaveBeenCalled();
        expect(component['authService'].getCurrentUser).toHaveBeenCalled();
        expect(component['authService'].isSuperAdmin).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle return URL', () => {
        const mockUser: User = {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            roles: [UserRole.USER],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;

        // Spy on the real service methods
        spyOn(component['authService'], 'isAuthenticated').and.returnValue(true);
        spyOn(component['authService'], 'getCurrentUser').and.returnValue(mockUser);
        spyOn(component['authService'], 'isSuperAdmin').and.returnValue(false);
        spyOn(component['authService'], 'isGroupAdmin').and.returnValue(false);
        spyOn(component['router'], 'navigate');

        // Setup return URL
        component['route'].snapshot.queryParams = { returnUrl: '/groups' };

        // Trigger ngOnInit by calling detectChanges
        fixture.detectChanges();

        expect(component['authService'].isAuthenticated).toHaveBeenCalled();
        expect(component['authService'].getCurrentUser).toHaveBeenCalled();
        expect(component['authService'].isSuperAdmin).toHaveBeenCalled();
        expect(component['router'].navigate).toHaveBeenCalledWith(['/groups']);
    });
});
