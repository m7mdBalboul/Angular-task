import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'rooms',
    loadComponent: () =>
      import('@pages/rooms/rooms.component').then(m => m.RoomsComponent),
    canActivate: [authGuard],
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('@pages/reservations/reservations.component').then(
        m => m.ReservationsComponent
      ),
    title: 'Reservations',
    canActivate: [authGuard],
  },
  {
    path: 'rooms/:id',
    loadComponent: () =>
      import('@pages/room-details/room-details.component').then(
        m => m.RoomComponent
      ),
    title: 'Room Details',
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    loadComponent: () =>
      import('../app/auth/auth.component').then(m => m.AuthComponent),
  },
  {
    path: '',
    redirectTo: 'rooms',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'rooms',
  },
];
