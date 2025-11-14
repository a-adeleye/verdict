export interface EntityOwner {
  id: string;
  entityId: string;
  userId: string;
  role: 'owner' | 'manager';
  createdAt: string;
}

export interface OwnershipClaim {
  id: string;
  entityId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  evidence: {
    website?: string;
    companyEmail?: string;
  };
  createdAt: string;
  resolvedAt?: string;
}
