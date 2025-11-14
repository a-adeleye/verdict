# Review App Implementation Outline

## Final Folder Structure
```
/ (repo root)
├── docs/
│   └── implementation-outline.md
├── frontend/
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.html
│       ├── main.ts
│       ├── styles.scss
│       ├── environments/
│       │   ├── environment.ts
│       │   └── environment.firebase.ts
│       └── app/
│           ├── app-routing.module.ts
│           ├── app.component.*
│           ├── layout/
│           │   └── home.component.*
│           ├── core/
│           │   ├── guards/
│           │   │   ├── admin.guard.ts
│           │   │   ├── auth.guard.ts
│           │   │   └── owner.guard.ts
│           │   └── services/
│           │       ├── auth.service.ts
│           │       └── mock-data.service.ts
│           ├── features/
│           │   ├── auth/
│           │   │   └── login.component.*
│           │   ├── entities/
│           │   │   ├── entity-detail/
│           │   │   │   └── entity-detail.component.*
│           │   │   └── entity-list/
│           │   │       └── entity-list.component.*
│           │   ├── owner/
│           │   │   └── dashboard/owner-dashboard.component.*
│           │   ├── admin/
│           │   │   └── claims/admin-claims.component.*
│           │   └── reviews/
│           │       └── write-review/write-review.component.*
│           └── shared/
│               ├── components/
│               │   ├── entity-card.component.*
│               │   └── rating-badge.component.*
│               ├── models/
│               │   ├── entity.model.ts
│               │   ├── ownership.model.ts
│               │   ├── review.model.ts
│               │   └── user.model.ts
│               └── utils/
│                   └── format-initials.ts
├── functions/
│   ├── package.json
│   └── src/
│       ├── index.ts
│       ├── review-aggregates.ts
│       └── ownership.ts
├── mock/
│   ├── entities.json
│   ├── entityOwners.json
│   ├── ownershipClaims.json
│   ├── reviewResponses.json
│   ├── reviews.json
│   └── users.json
├── firestore.rules
├── review-app.prd.md
├── review-app.data-model.md
├── review-app.architecture.md
├── review-app.functions-spec.md
├── review-app.security.md
└── review-app.ui-spec.md
```

## Phase 1 – Static Mock Data (Implemented)
1. **Bootstrap Angular SPA**
   - Minimal standalone component setup with Angular 17 standalone APIs.
   - Global Airbnb-inspired styling via `styles.scss`.
2. **Mock data layer**
   - JSON datasets for every top-level collection.
   - `MockDataService` orchestrates reads/writes and recomputes aggregates locally.
   - `AuthService` provides role-based mock sessions.
3. **Routing & layout**
   - Header/footer scaffolding with responsive navigation and role-aware menus.
   - Routes per PRD: home, explore, entity detail, write review, owner dashboard, admin claims, login.
4. **Public experience**
   - Home hero with curated cards.
   - Explore page with search and type filters.
   - Entity detail with reviews, aggregates, owner responses, and inline claim form.
5. **Review authoring**
   - Two-step flow: select/create entity, then compose review.
   - Local creation updates entity aggregates instantly.
6. **Owner tools**
   - Dashboard lists owned entities with review response composer.
   - Responses persist in mock state.
7. **Admin moderation**
   - Claims table with approve/reject actions adjusting ownership + claims state.
8. **Phase-ready hooks**
   - Environment flags for switching to Firebase integration in Phase 2.

## Phase 2 – Firebase Integration (Planned)
1. **Firebase project setup**
   - Enable Auth (email link + Google) and Firestore.
   - Configure custom claims for roles (`regular`, `owner`, `admin`).
2. **Replace AuthService logic**
   - Use Firebase Auth observers.
   - Implement magic-link flow (`sendSignInLinkToEmail`) and Google provider.
   - Persist `users/{userId}` documents on first login.
3. **Data layer swap**
   - Introduce `FirestoreDataService` mirroring `MockDataService` signatures.
   - Queries per collection: entities listing, entity detail with reviews/responses, owner dashboards via collection group queries.
   - Writes routed through Firestore with optimistic UI updates.
4. **Review aggregates**
   - Deploy Cloud Functions from `functions/src` to maintain entity metrics and manage claim approvals.
5. **Security**
   - Publish `firestore.rules` enforcing role-based access and per-doc ownership.
   - Validate via Firebase Emulator test suite (owners can only respond to owned entity reviews, etc.).
6. **Cloud Function callable/admin tooling**
   - Admin claim approvals executed via callable functions to ensure atomic updates.
   - Owner onboarding flow ensures deterministic `entityOwners` document IDs (`${entityId}_${userId}`).
7. **Production polish**
   - Swap environment config to Firebase values, remove mock JSON usage, and gate debug utilities behind feature flags.
   - QA across sign-in flows, review creation/edit/delete, claim lifecycle, owner responses, and admin dashboards.
