import { Routes } from '@angular/router';
import { HomeComponent } from './layout/home.component';
import { LoginComponent } from './features/auth/login.component';
import { EntityListComponent } from './features/entities/entity-list/entity-list.component';
import { EntityDetailComponent } from './features/entities/entity-detail/entity-detail.component';
import { WriteReviewComponent } from './features/reviews/write-review/write-review.component';
import { OwnerDashboardComponent } from './features/owner/dashboard/owner-dashboard.component';
import { AdminClaimsComponent } from './features/admin/claims/admin-claims.component';
import { AuthGuard } from './core/guards/auth.guard';
import { OwnerGuard } from './core/guards/owner.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'entities', component: EntityListComponent },
  { path: 'entities/:id', component: EntityDetailComponent },
  { path: 'write-review', component: WriteReviewComponent, canActivate: [AuthGuard] },
  { path: 'owner/dashboard', component: OwnerDashboardComponent, canActivate: [OwnerGuard] },
  { path: 'admin/claims', component: AdminClaimsComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '' }
];
