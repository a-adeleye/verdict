import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, of, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Entity } from '../../../shared/models/entity.model';
import { Review, ReviewResponse } from '../../../shared/models/review.model';

interface ReviewWithResponse extends Review {
  response?: ReviewResponse;
  draft?: string;
}

interface OwnedEntityView {
  entity: Entity;
  reviews: ReviewWithResponse[];
}

@Component({
  standalone: true,
  selector: 'app-owner-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent {
  readonly auth = inject(AuthService);
  private readonly data = inject(MockDataService);

  readonly dashboard$ = this.auth.user$.pipe(
    switchMap((user) => {
      if (!user) {
        return of<OwnedEntityView[]>([]);
      }
      return this.data.getOwnedEntities(user.id).pipe(
        switchMap((entities) => {
          if (!entities.length) {
            return of<OwnedEntityView[]>([]);
          }
          return combineLatest(
            entities.map((entity) =>
              combineLatest([
                of(entity),
                this.data.getReviewsForEntity(entity.id),
                this.data.getReviewResponses(entity.id)
              ]).pipe(
                map(([entitySnapshot, reviews, responses]) => ({
                  entity: entitySnapshot,
                  reviews: reviews.map((review) => ({
                    ...review,
                    response: responses.find((resp) => resp.reviewId === review.id),
                    draft: responses.find((resp) => resp.reviewId === review.id)?.body ?? ''
                  }))
                }))
              )
            )
          );
        })
      );
    })
  );

  updateDraft(review: ReviewWithResponse, value: string): void {
    review.draft = value;
  }

  saveResponse(review: ReviewWithResponse, entity: Entity, ownerId: string): void {
    if (!review.draft?.trim()) {
      alert('Response cannot be empty.');
      return;
    }
    const response: ReviewResponse = {
      id: review.response?.id ?? `response_${review.id}`,
      reviewId: review.id,
      entityId: entity.id,
      ownerUserId: ownerId,
      body: review.draft.trim(),
      status: 'published',
      createdAt: review.response?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.respondToReview(response);
  }
}
