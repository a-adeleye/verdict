import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-rating-badge',
  imports: [CommonModule],
  template: `
    <span class="rating">
      <span class="star">★</span>
      <span>{{ rating | number: '1.1-1' }}</span>
      <span class="count">({{ count }})</span>
    </span>
  `,
  styleUrls: ['./rating-badge.component.scss']
})
export class RatingBadgeComponent {
  @Input({ required: true }) rating!: number;
  @Input({ required: true }) count!: number;
}
