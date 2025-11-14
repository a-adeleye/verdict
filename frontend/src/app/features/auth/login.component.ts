import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { UserProfile } from '../../shared/models/user.model';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly data = inject(MockDataService);
  readonly users$: Observable<UserProfile[]> = this.data.getMockUsers();
  email = '';

  onSendMagicLink(): void {
    alert(`Phase 1 mock: would send magic link to ${this.email}`);
  }

  onGoogleLogin(): void {
    alert('Phase 1 mock: would trigger Google login');
  }

  loginAs(userId: string): void {
    this.auth.loginAs(userId);
    this.router.navigate(['/']);
  }
}
