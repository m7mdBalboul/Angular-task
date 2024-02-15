import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from 'src/app/auth/auth.service';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterModule, ButtonModule, SidebarModule],
  selector: 'app-header',
  standalone: true,
  template: `
    <header
      class="w-screen h-16 bg-gray-800 text-white flex items-center justify-center"
    >
      <div class="container flex items-center justify-between w-full">
        <p class="text-2xl font-bold">
          <i class="pi pi-home text-2xl"></i> Hotel Management
        </p>

        <p-sidebar [(visible)]="sidebarVisible">
          <nav
            class="flex flex-col gap-2 items-stretch justify-center [&_button]:w-full"
          >
            <p-button label="Rooms" [outlined]="true" routerLink="/" />
            <p-button
              label="Reservations"
              routerLink="/reservations"
              severity="secondary"
            />
            @if (isAuthenticated) {
              <p-button label="Log Out" (click)="logOut()" [outlined]="true" />
            }
          </nav>
        </p-sidebar>
        <p-button
          icon="pi pi-bars"
          (click)="sidebarVisible = !sidebarVisible"
          class="md:hidden me-3"
        />
        <nav class="gap-2 hidden md:flex">
          <p-button label="Rooms" [outlined]="true" routerLink="/" />
          <p-button
            label="Reservations"
            routerLink="/reservations"
            severity="secondary"
          />
          @if (isAuthenticated) {
            <p-button label="Log Out" (click)="logOut()" [outlined]="true" />
          }
        </nav>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  isAuthenticated = false;
  private userSub!: Subscription;
  sidebarVisible = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.userSub = this.authService.user.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  logOut() {
    this.authService.logout();
  }
}
