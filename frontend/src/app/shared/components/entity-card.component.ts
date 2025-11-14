import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Entity } from '../models/entity.model';
import { RatingBadgeComponent } from './rating-badge.component';

@Component({
  standalone: true,
  selector: 'app-entity-card',
  imports: [CommonModule, RouterModule, RatingBadgeComponent],
  template: `
    <a [routerLink]="['/entities', entity.id]" class="card entity-card">
      <div class="entity-card__meta">
        <span class="badge">{{ entity.type }}</span>
        <app-rating-badge [rating]="entity.ratingAverage" [count]="entity.ratingCount"></app-rating-badge>
      </div>
      <h3>{{ entity.name }}</h3>
      <p class="text-muted">{{ entity.description }}</p>
    </a>
  `,
  styleUrls: ['./entity-card.component.scss']
})
export class EntityCardComponent {
  @Input({ required: true }) entity!: Entity;
}
