export enum UserRole {
  Regular = 'regular',
  Owner = 'owner',
  Admin = 'admin'
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  initials: string;
}
