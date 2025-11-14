import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntityCardComponent } from '../shared/components/entity-card.component';
import { MockDataService } from '../core/services/mock-data.service';
import { Observable } from 'rxjs';
import { Entity } from '../shared/models/entity.model';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, RouterModule, EntityCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private readonly data = inject(MockDataService);
  readonly featuredEntities$: Observable<Entity[]> = this.data.getTopRatedEntities(6);
}
