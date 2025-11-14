import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { UserRole } from './shared/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly auth = inject(AuthService);
  readonly user$ = this.auth.user$;
  readonly UserRole = UserRole;

  onLogout(): void {
    this.auth.logout();
  }
}
