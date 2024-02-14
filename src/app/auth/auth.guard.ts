import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.user.pipe(
    take(1),
    map(user => {
      const isAuth = !!user;
      if (isAuth) {
        return true;
      }
      return router.createUrlTree(['/auth']);
    })
  );
};
