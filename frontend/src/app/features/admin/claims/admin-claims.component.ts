import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { OwnershipClaim } from '../../../shared/models/ownership.model';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-admin-claims',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-claims.component.html',
  styleUrl: './admin-claims.component.scss'
})
export class AdminClaimsComponent {
  private readonly data = inject(MockDataService);
  status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending';
  claims$: Observable<OwnershipClaim[]> = this.data.getOwnershipClaims(this.status);

  onFilterChange(): void {
    this.claims$ = this.data.getOwnershipClaims(this.status);
  }

  approve(claim: OwnershipClaim): void {
    this.data.moderateClaim(claim.id, 'approved');
  }

  reject(claim: OwnershipClaim): void {
    this.data.moderateClaim(claim.id, 'rejected');
  }
}
