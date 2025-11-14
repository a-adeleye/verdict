import { Injectable } from '@angular/core';
import entitiesData from '../../../../mock/entities.json';
import reviewsData from '../../../../mock/reviews.json';
import usersData from '../../../../mock/users.json';
import entityOwnersData from '../../../../mock/entityOwners.json';
import claimsData from '../../../../mock/ownershipClaims.json';
import reviewResponsesData from '../../../../mock/reviewResponses.json';
import { Entity } from '../../shared/models/entity.model';
import { Review, ReviewResponse } from '../../shared/models/review.model';
import { EntityOwner, OwnershipClaim } from '../../shared/models/ownership.model';
import { UserProfile } from '../../shared/models/user.model';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { formatInitials } from '../../shared/utils/format-initials';

interface MockState {
  entities: Entity[];
  reviews: Review[];
  users: UserProfile[];
  entityOwners: EntityOwner[];
  ownershipClaims: OwnershipClaim[];
  reviewResponses: ReviewResponse[];
}

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private readonly state$ = new BehaviorSubject<MockState>(this.bootstrapState());

  getEntities(): Observable<Entity[]> {
    return this.state$.pipe(map((state) => state.entities.filter((e) => e.status === 'active')));
  }

  getEntityById(id: string): Observable<Entity | undefined> {
    return this.state$.pipe(map((state) => state.entities.find((entity) => entity.id === id)));
  }

  searchEntities(term: string, type?: string): Observable<Entity[]> {
    return this.getEntities().pipe(
      map((entities) =>
        entities.filter((entity) => {
          const matchesTerm = term ? entity.name.toLowerCase().includes(term.toLowerCase()) : true;
          const matchesType = type ? entity.type === type : true;
          return matchesTerm && matchesType;
        })
      )
    );
  }

  getReviewsForEntity(entityId: string): Observable<Review[]> {
    return this.state$.pipe(
      map((state) => state.reviews.filter((review) => review.entityId === entityId && review.status === 'published'))
    );
  }

  getReviewResponses(entityId: string): Observable<ReviewResponse[]> {
    return this.state$.pipe(
      map((state) => state.reviewResponses.filter((resp) => resp.entityId === entityId && resp.status === 'published'))
    );
  }

  getTopRatedEntities(limit: number): Observable<Entity[]> {
    return this.getEntities().pipe(
      map((entities) =>
        [...entities]
          .sort((a, b) => b.ratingAverage - a.ratingAverage)
          .slice(0, limit)
      )
    );
  }

  getOwnedEntities(userId: string): Observable<Entity[]> {
    return this.state$.pipe(
      map((state) => {
        const ownedIds = state.entityOwners.filter((owner) => owner.userId === userId).map((owner) => owner.entityId);
        return state.entities.filter((entity) => ownedIds.includes(entity.id));
      })
    );
  }

  getOwnershipClaims(status: 'pending' | 'approved' | 'rejected' | 'all' = 'pending'): Observable<OwnershipClaim[]> {
    return this.state$.pipe(
      map((state) =>
        status === 'all' ? state.ownershipClaims : state.ownershipClaims.filter((claim) => claim.status === status)
      )
    );
  }

  getUserProfile(userId: string): Observable<UserProfile | undefined> {
    return this.state$.pipe(map((state) => state.users.find((user) => user.id === userId)));
  }

  findUserById(userId: string): UserProfile | undefined {
    return this.state$.value.users.find((user) => user.id === userId);
  }

  getMockUsers(): Observable<UserProfile[]> {
    return this.state$.pipe(map((state) => state.users));
  }

  submitReview(review: Review): void {
    const state = this.state$.value;
    const entityIndex = state.entities.findIndex((entity) => entity.id === review.entityId);
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    const updatedEntity = this.recalculateEntityAggregates(state.entities[entityIndex], review, 'add');
    this.state$.next({
      ...state,
      reviews: [...state.reviews, review],
      entities: state.entities.map((entity, index) => (index === entityIndex ? updatedEntity : entity))
    });
  }

  updateReview(updated: Review): void {
    const state = this.state$.value;
    const existing = state.reviews.find((review) => review.id === updated.id);
    if (!existing) {
      throw new Error('Review not found');
    }
    const entityIndex = state.entities.findIndex((entity) => entity.id === updated.entityId);
    if (entityIndex === -1) {
      throw new Error('Entity not found');
    }
    const recalculated = this.recalculateEntityAggregates(state.entities[entityIndex], updated, 'update', existing);
    this.state$.next({
      ...state,
      reviews: state.reviews.map((review) => (review.id === updated.id ? updated : review)),
      entities: state.entities.map((entity, index) => (index === entityIndex ? recalculated : entity))
    });
  }

  deleteReview(reviewId: string): void {
    const state = this.state$.value;
    const existing = state.reviews.find((review) => review.id === reviewId);
    if (!existing) {
      return;
    }
    const entityIndex = state.entities.findIndex((entity) => entity.id === existing.entityId);
    if (entityIndex === -1) {
      return;
    }
    const recalculated = this.recalculateEntityAggregates(state.entities[entityIndex], existing, 'remove');
    this.state$.next({
      ...state,
      reviews: state.reviews.filter((review) => review.id !== reviewId),
      entities: state.entities.map((entity, index) => (index === entityIndex ? recalculated : entity))
    });
  }

  createEntity(entity: Entity): void {
    const state = this.state$.value;
    this.state$.next({ ...state, entities: [...state.entities, entity] });
  }

  submitClaim(claim: OwnershipClaim): void {
    const state = this.state$.value;
    this.state$.next({ ...state, ownershipClaims: [...state.ownershipClaims, claim] });
  }

  moderateClaim(claimId: string, status: 'approved' | 'rejected'): void {
    const state = this.state$.value;
    const updatedClaims = state.ownershipClaims.map((claim) =>
      claim.id === claimId
        ? {
            ...claim,
            status,
            resolvedAt: new Date().toISOString()
          }
        : claim
    );
    let updatedOwners = state.entityOwners;
    if (status === 'approved') {
      const claim = state.ownershipClaims.find((c) => c.id === claimId);
      if (claim) {
        updatedOwners = [
          ...state.entityOwners,
          {
            id: `ownership_${claim.entityId}_${claim.userId}`,
            entityId: claim.entityId,
            userId: claim.userId,
            role: 'owner',
            createdAt: new Date().toISOString()
          }
        ];
      }
    }
    this.state$.next({ ...state, ownershipClaims: updatedClaims, entityOwners: updatedOwners });
  }

  respondToReview(response: ReviewResponse): void {
    const state = this.state$.value;
    const existing = state.reviewResponses.find((resp) => resp.reviewId === response.reviewId);
    const updatedResponses = existing
      ? state.reviewResponses.map((resp) => (resp.reviewId === response.reviewId ? response : resp))
      : [...state.reviewResponses, response];
    this.state$.next({ ...state, reviewResponses: updatedResponses });
  }

  private bootstrapState(): MockState {
    const users: UserProfile[] = usersData.map((user) => ({
      ...user,
      initials: formatInitials(user.displayName)
    }));
    return {
      entities: entitiesData as Entity[],
      reviews: reviewsData as Review[],
      users,
      entityOwners: entityOwnersData as EntityOwner[],
      ownershipClaims: claimsData as OwnershipClaim[],
      reviewResponses: reviewResponsesData as ReviewResponse[]
    };
  }

  private recalculateEntityAggregates(
    entity: Entity,
    review: Review,
    operation: 'add' | 'update' | 'remove',
    existing?: Review
  ): Entity {
    let ratingSum = entity.ratingSum;
    let ratingCount = entity.ratingCount;

    if (operation === 'add') {
      ratingSum += review.rating;
      ratingCount += 1;
    }

    if (operation === 'update' && existing) {
      ratingSum = ratingSum - existing.rating + review.rating;
    }

    if (operation === 'remove') {
      ratingSum -= review.rating;
      ratingCount = Math.max(0, ratingCount - 1);
    }

    const ratingAverage = ratingCount === 0 ? 0 : parseFloat((ratingSum / ratingCount).toFixed(2));

    return {
      ...entity,
      ratingSum,
      ratingCount,
      ratingAverage,
      lastReviewAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
