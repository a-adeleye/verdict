import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../../shared/models/user.model';

export const OwnerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.currentUserId || !auth.hasRole(UserRole.Owner)) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};
