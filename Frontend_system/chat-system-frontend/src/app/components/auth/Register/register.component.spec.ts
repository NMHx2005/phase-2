import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RegisterComponent } from './register.component';
import { AuthService } from '../auth.service';
import { TestHelpers } from '../../../testing/test-helpers';
import { UserRole } from '../../../models/user.model';

describe('RegisterComponent', () => {
    let component: RegisterComponent;
    let fixture: ComponentFixture<RegisterComponent>;
    let authService: jasmine.SpyObj<AuthService>;
    let router: jasmine.SpyObj<Router>;
    let snackBar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(async () => {
        const authSpy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated', 'logout', 'getCurrentUser', 'isSuperAdmin']);
        const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            imports: [RegisterComponent, HttpClientTestingModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpy },
                { provide: MatSnackBar, useValue: snackBarSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterComponent);
        component = fixture.componentInstance;
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should handle successful registration', async () => {
        authService.register.and.returnValue(Promise.resolve(true));
        authService.logout.and.returnValue(Promise.resolve());
        spyOn(component['snackBar'], 'open').and.callThrough();

        const formData = {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(authService.register).toHaveBeenCalledWith({
            username: formData.username,
            email: formData.email,
            password: formData.password
        });
        expect(authService.logout).toHaveBeenCalled();
        expect(component['snackBar'].open).toHaveBeenCalledWith('Registration successful! Please sign in.', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
        });
        expect(router.navigate).toHaveBeenCalledWith(['/login'], {
            queryParams: { registered: 'true' }
        });
    });

    it('should handle registration failure', async () => {
        authService.register.and.returnValue(Promise.resolve(false));
        spyOn(component['snackBar'], 'open').and.callThrough();

        const formData = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(component['snackBar'].open).toHaveBeenCalledWith(
            'Registration failed. Please try again.',
            'Close',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
    });

    it('should handle registration error', async () => {
        authService.register.and.returnValue(Promise.reject(new Error('Network error')));
        spyOn(component['snackBar'], 'open').and.callThrough();

        const formData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(component['snackBar'].open).toHaveBeenCalledWith('Network error', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    });

    it('should navigate to login', () => {
        component.navigateToLogin();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should set loading state during registration', async () => {
        authService.register.and.returnValue(new Promise(resolve => setTimeout(() => resolve(true), 100)));
        authService.logout.and.returnValue(Promise.resolve());

        const formData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        const promise = component.onRegisterSubmit(formData);
        expect(component.isLoading).toBe(true);

        await promise;
        expect(component.isLoading).toBe(false);
    });

    it('should redirect if user is already authenticated', () => {
        authService.isAuthenticated.and.returnValue(true);
        const mockUser = {
            id: '1',
            username: 'test',
            email: 'test@example.com',
            roles: [UserRole.USER],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
        authService.getCurrentUser.and.returnValue(mockUser);
        authService.isSuperAdmin.and.returnValue(false);

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/home']);
    });

    it('should redirect to admin if user is super admin', () => {
        authService.isAuthenticated.and.returnValue(true);
        const adminUser = {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            roles: [UserRole.SUPER_ADMIN],
            groups: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
        authService.getCurrentUser.and.returnValue(adminUser);
        authService.isSuperAdmin.and.returnValue(true);

        component.ngOnInit();

        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should handle registration error with specific error message', async () => {
        const error = { error: { message: 'Username already exists' } };
        authService.register.and.returnValue(Promise.reject(error));
        spyOn(component['snackBar'], 'open').and.callThrough();

        const formData = {
            username: 'existinguser',
            email: 'existing@example.com',
            password: 'password123',
            confirmPassword: 'password123'
        };

        await component.onRegisterSubmit(formData);

        expect(component['snackBar'].open).toHaveBeenCalledWith('Username already exists', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    });
});
