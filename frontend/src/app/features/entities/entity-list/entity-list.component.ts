import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Entity, EntityType } from '../../../shared/models/entity.model';
import { MockDataService } from '../../../core/services/mock-data.service';
import { EntityCardComponent } from '../../../shared/components/entity-card.component';

@Component({
  standalone: true,
  selector: 'app-entity-list',
  imports: [CommonModule, FormsModule, EntityCardComponent],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.scss'
})
export class EntityListComponent {
  private readonly data = inject(MockDataService);

  term = '';
  type: EntityType | '' = '';
  entities$: Observable<Entity[]> = this.data.getEntities();

  onSearchChange(): void {
    this.entities$ = this.data.searchEntities(this.term, this.type || undefined);
  }
}
