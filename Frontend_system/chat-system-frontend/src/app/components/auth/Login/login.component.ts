import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { AuthService } from '../auth.service';
import { LoginRequest, LoginResponse } from '../../../services/api.service';
import { LoginFormComponent, LoginFormData } from './ui/login-form.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        MatSnackBarModule,
        LoginFormComponent
    ],
    template: `
    <app-login-form
      [isLoading]="isLoading"
      [successMessage]="successMessage"
      [errorMessage]="errorMessage"
      (onSubmit)="onLoginSubmit($event)"
      (onRegisterClick)="navigateToRegister()"
      (onForgotPasswordClick)="navigateToPasswordReset()">
    </app-login-form>
  `,
    styles: [``]
})
export class LoginComponent implements OnInit, OnDestroy {
    isLoading = false;
    successMessage = '';
    errorMessage = '';

    private destroy$ = new Subject<void>();

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        // Check if user is already authenticated
        if (this.authService.isAuthenticated()) {
            this.redirectToAppropriatePage();
            return;
        }

        // Check for success message from registration
        this.route.queryParams
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                if (params['registered'] === 'true') {
                    this.successMessage = 'Registration successful! Please sign in.';
                    // Clear the query parameter
                    this.router.navigate([], {
                        relativeTo: this.route,
                        queryParams: {}
                    });
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onLoginSubmit(formData: LoginFormData): void {
        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.authService.login(formData.username, formData.password)
            .then((success: boolean) => {
                if (success) {
                    this.snackBar.open('Login successful!', 'Close', { duration: 3000 });
                    this.redirectToAppropriatePage();
                } else {
                    this.errorMessage = 'Invalid credentials. Please try again.';
                    this.snackBar.open('Invalid credentials. Please try again.', 'Close', { duration: 5000 });
                }
            })
            .catch((error: any) => {
                console.error('Login error:', error);
                this.handleLoginError(error);
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    navigateToRegister(): void {
        this.router.navigate(['/register']);
    }

    navigateToPasswordReset(): void {
        this.router.navigate(['/password-reset']);
    }


    private handleLoginError(error: any): void {
        let errorMsg = 'Login failed. Please try again.';

        if (error.error?.message) {
            errorMsg = error.error.message;
        } else if (error.message) {
            errorMsg = error.message;
        } else if (error.status === 401) {
            errorMsg = 'Invalid credentials';
        } else if (error.status === 403) {
            errorMsg = 'Your account has been locked. Please contact administrator.';
        } else if (error.status === 0) {
            errorMsg = 'Unable to connect to server. Please check your internet connection.';
        }

        this.errorMessage = errorMsg;
        this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    private redirectToAppropriatePage(): void {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            this.router.navigate(['/home']);
            return;
        }

        // Check for return URL
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';

        // Redirect based on user role
        if (this.authService.isSuperAdmin()) {
            this.router.navigate(['/admin']);
        } else if (this.authService.isGroupAdmin()) {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate([returnUrl]);
        }
    }
}
