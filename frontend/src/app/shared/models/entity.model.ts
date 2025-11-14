export type EntityType = 'brand' | 'product' | 'movie' | 'music';

export interface EntityMetadata {
  brandId?: string;
  releaseYear?: number;
  director?: string;
  artist?: string;
  sku?: string;
  website?: string;
  [key: string]: unknown;
}

export interface Entity {
  id: string;
  type: EntityType;
  name: string;
  slug: string;
  description?: string;
  createdBy: string;
  status: 'active' | 'pending_verification' | 'hidden';
  ratingCount: number;
  ratingSum: number;
  ratingAverage: number;
  lastReviewAt?: string;
  metadata: EntityMetadata;
  createdAt: string;
  updatedAt: string;
}

export interface EntityWithAggregates extends Entity {
  reviewsCount: number;
}
