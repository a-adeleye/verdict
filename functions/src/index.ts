import * as admin from 'firebase-admin';
import { onReviewCreate, onReviewUpdate, onReviewDelete } from './review-aggregates';
import { approveClaim, rejectClaim, onOwnershipClaimCreate } from './ownership';

if (!admin.apps.length) {
  admin.initializeApp();
}

export { onReviewCreate, onReviewUpdate, onReviewDelete, approveClaim, rejectClaim, onOwnershipClaimCreate };
