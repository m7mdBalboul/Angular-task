import { inject } from '@angular/core';
import { take, exhaustMap } from 'rxjs/operators';
import { HttpParams, HttpInterceptorFn } from '@angular/common/http';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return authService.user.pipe(
    take(1),
    exhaustMap(user => {
      console.log('user', user);
      if (!user) {
        return next(req);
      }

      const modifiedReq = req.clone({
        params: new HttpParams().set('auth', user.id),
      });
      return next(modifiedReq);
    })
  );
};
