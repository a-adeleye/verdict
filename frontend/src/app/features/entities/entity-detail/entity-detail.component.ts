import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { combineLatest, map } from 'rxjs';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Entity } from '../../../shared/models/entity.model';
import { Review, ReviewResponse } from '../../../shared/models/review.model';
import { RatingBadgeComponent } from '../../../shared/components/rating-badge.component';
import { AuthService } from '../../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { OwnershipClaim } from '../../../shared/models/ownership.model';
import { UserRole } from '../../../shared/models/user.model';

interface ReviewWithResponse extends Review {
  response?: ReviewResponse;
}

@Component({
  standalone: true,
  selector: 'app-entity-detail',
  imports: [CommonModule, RouterModule, RatingBadgeComponent, FormsModule],
  templateUrl: './entity-detail.component.html',
  styleUrl: './entity-detail.component.scss'
})
export class EntityDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(MockDataService);
  private readonly auth = inject(AuthService);

  readonly entity$ = this.route.paramMap.pipe(
    switchMap((params) => this.data.getEntityById(params.get('id') ?? ''))
  );

  readonly reviews$ = this.route.paramMap.pipe(
    switchMap((params) => this.data.getReviewsForEntity(params.get('id') ?? ''))
  );

  readonly responses$ = this.route.paramMap.pipe(
    switchMap((params) => this.data.getReviewResponses(params.get('id') ?? ''))
  );

  readonly reviewFeed$ = combineLatest([this.reviews$, this.responses$]).pipe(
    map(([reviews, responses]) =>
      reviews.map((review) => ({
        ...review,
        response: responses.find((response) => response.reviewId === review.id)
      }))
    )
  );

  claimOpen = signal(false);
  claimMessage = '';
  claimWebsite = '';
  claimEmail = '';

  get userId(): string | null {
    return this.auth.currentUserId;
  }

  get isOwner(): boolean {
    return this.auth.hasRole(UserRole.Owner);
  }

  onSubmitClaim(entity: Entity): void {
    if (!this.userId) {
      alert('Log in to submit a claim.');
      return;
    }
    const claim: OwnershipClaim = {
      id: `claim_${entity.id}_${Date.now()}`,
      entityId: entity.id,
      userId: this.userId,
      status: 'pending',
      message: this.claimMessage,
      evidence: {
        website: this.claimWebsite,
        companyEmail: this.claimEmail
      },
      createdAt: new Date().toISOString()
    };
    this.data.submitClaim(claim);
    this.claimOpen.set(false);
    this.claimMessage = '';
    this.claimWebsite = '';
    this.claimEmail = '';
    alert('Claim submitted (mock).');
  }

  onDeleteReview(review: Review): void {
    if (review.userId !== this.userId) {
      return;
    }
    this.data.deleteReview(review.id);
  }
}
