import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Entity, EntityType } from '../../../shared/models/entity.model';
import { Review } from '../../../shared/models/review.model';
import { AuthService } from '../../../core/services/auth.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-write-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './write-review.component.html',
  styleUrl: './write-review.component.scss'
})
export class WriteReviewComponent {
  private readonly data = inject(MockDataService);
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  stage = signal<'select' | 'compose' | 'success'>('select');
  entities$: Observable<Entity[]> = this.data.getEntities();
  selectedEntity: Entity | null = null;
  createNew = false;

  // Compose fields
  newEntity: Partial<Entity> = {
    type: 'brand'
  };
  rating = 5;
  title = '';
  body = '';

  constructor() {
    const entityId = this.route.snapshot.queryParamMap.get('entityId');
    if (entityId) {
      this.data.getEntityById(entityId).subscribe((entity) => {
        if (entity) {
          this.selectEntity(entity);
        }
      });
    }
  }

  onSearch(term: string): void {
    this.entities$ = this.data.searchEntities(term, undefined);
  }

  selectEntity(entity: Entity): void {
    this.selectedEntity = entity;
    this.createNew = false;
    this.stage.set('compose');
  }

  createEntity(type: EntityType): void {
    this.createNew = true;
    this.newEntity = {
      type,
      name: '',
      description: ''
    } as Partial<Entity>;
    this.stage.set('compose');
  }

  submit(): void {
    const userId = this.auth.currentUserId;
    if (!userId) {
      alert('Please log in to write a review.');
      return;
    }

    let entity = this.selectedEntity;
    if (this.createNew) {
      const id = `entity_${Date.now()}`;
      entity = {
        id,
        type: this.newEntity.type!,
        name: this.newEntity.name ?? '',
        slug: (this.newEntity.name ?? '').toLowerCase().replace(/\s+/g, '-'),
        description: this.newEntity.description,
        createdBy: userId,
        status: 'pending_verification',
        ratingCount: 0,
        ratingSum: 0,
        ratingAverage: 0,
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.data.createEntity(entity);
    }

    if (!entity) {
      return;
    }

    const review: Review = {
      id: `review_${Date.now()}`,
      entityId: entity.id,
      userId,
      rating: this.rating,
      title: this.title,
      body: this.body,
      status: 'published',
      likesCount: 0,
      dislikesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.submitReview(review);
    this.stage.set('success');
  }

  reset(): void {
    this.stage.set('select');
    this.selectedEntity = null;
    this.createNew = false;
    this.rating = 5;
    this.title = '';
    this.body = '';
  }
}
