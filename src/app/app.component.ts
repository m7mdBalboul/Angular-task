import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { AuthService } from './auth/auth.service';
import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  standalone: true,
  selector: 'app-root',
  template: `
    <app-header />
    <main class="w-screen h-screen max-w-full pt-4">
      <div class="container w-full mx-auto pb-20">
        <router-outlet />
      </div>
    </main>
  `,
  imports: [
    RouterOutlet,
    RouterModule,
    ButtonModule,
    SidebarModule,
    HeaderComponent,
  ],
})
export class AppComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.handleAutoLogin();
  }
}
