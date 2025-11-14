import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MockDataService } from './mock-data.service';
import { UserProfile, UserRole } from '../../shared/models/user.model';
import { formatInitials } from '../../shared/utils/format-initials';

export interface AuthSession {
  userId: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session$ = new BehaviorSubject<AuthSession | null>(null);
  readonly user$: Observable<UserProfile | null> = this.session$.pipe(
    map((session) => {
      if (!session) {
        return null;
      }
      const user = this.mockData.findUserById(session.userId);
      return user ? { ...user, initials: user.initials ?? formatInitials(user.displayName) } : null;
    })
  );

  constructor(private readonly mockData: MockDataService) {}

  loginAs(userId: string): void {
    const user = this.mockData.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    this.session$.next({ userId: user.id, role: user.role });
  }

  logout(): void {
    this.session$.next(null);
  }

  get currentUserId(): string | null {
    return this.session$.value?.userId ?? null;
  }

  hasRole(role: UserRole): boolean {
    return this.session$.value?.role === role;
  }
}
