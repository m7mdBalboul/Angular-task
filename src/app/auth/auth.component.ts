import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService, AuthResponseData } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    DividerModule,
    PasswordModule,
    InputTextModule,
  ],
  template: `
    <div class="flex">
      <div class="w-full md:w-1/2 mx-auto">
        @if (error) {
          <div class="alert alert-error">
            <p>{{ error }}</p>
          </div>
        }

        @if (isLoading) {
          <div class="text-center">Loading...</div>
        }

        @if (!isLoading) {
          <form
            #authForm="ngForm"
            (ngSubmit)="onSubmit(authForm)"
            class="flex flex-col items-stretch gap-4"
          >
            @if (!isLoginMode) {
              <div class="flex flex-col gap-2">
                <label for="username">Username</label>
                <input
                  type="username"
                  id="username"
                  ngModel
                  name="username"
                  required
                  pInputText
                  username
                />
              </div>
            }

            <div class="flex flex-col gap-2">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                ngModel
                name="email"
                required
                pInputText
                email
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="password">Password</label>
              <p-password
                [inputStyle]="{ width: '100%' }"
                class="[&>div]:w-full"
                ngModel
                name="password"
                id="password"
                required
              />
            </div>

            <div class="flex items-center gap-3 mx-auto flex-col md:flex-row">
              <p-button type="submit" [disabled]="!authForm.valid">
                {{ isLoginMode ? 'Login' : 'Sign Up' }}
              </p-button>
              <p-divider
                type="solid"
                layout="vertical"
                class="hidden md:block"
              />
              <p-button (click)="onSwitchMode()" type="button" severity="secondary">
                Go to {{ isLoginMode ? 'Sign Up' : 'Login' }}
              </p-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    const userName = form.value.username;

    let authObs: Observable<AuthResponseData>;

    this.isLoading = true;

    if (this.isLoginMode) {
      authObs = this.authService.login(email, password);
    } else {
      authObs = this.authService.signup(email, password, userName);
    }

    authObs.subscribe({
      next: resData => {
        this.isLoading = false;
        this.router.navigate(['/rooms']);
      },
      error: errorMessage => {
        this.error = errorMessage;
        this.isLoading = false;
      },
    });

    form.reset();
  }
}
