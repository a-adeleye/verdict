export interface Review {
  id: string;
  entityId: string;
  userId: string;
  rating: number;
  title?: string;
  body: string;
  status: 'published' | 'pending' | 'flagged' | 'deleted';
  likesCount: number;
  dislikesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  entityId: string;
  ownerUserId: string;
  body: string;
  status: 'published' | 'hidden';
  createdAt: string;
  updatedAt: string;
}
