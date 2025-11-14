import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

interface OwnershipClaim {
  entityId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  evidence?: {
    website?: string;
    companyEmail?: string;
  };
}

function assertAdmin(context: functions.https.CallableContext): void {
  if (!context.auth || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin privileges required.');
  }
}

async function updateClaimStatus(claimId: string, status: 'approved' | 'rejected'): Promise<OwnershipClaim> {
  const claimRef = db.collection('ownershipClaims').doc(claimId);
  const claimSnap = await claimRef.get();
  if (!claimSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Claim not found');
  }
  const claim = claimSnap.data() as OwnershipClaim;
  if (claim.status !== 'pending') {
    throw new functions.https.HttpsError('failed-precondition', 'Only pending claims can be moderated.');
  }

  await claimRef.update({
    status,
    resolvedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return claim;
}

export const approveClaim = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const { claimId } = data as { claimId: string };
  if (!claimId) {
    throw new functions.https.HttpsError('invalid-argument', 'claimId is required');
  }

  const claim = await updateClaimStatus(claimId, 'approved');
  const ownerId = `${claim.entityId}_${claim.userId}`;
  await db.collection('entityOwners').doc(ownerId).set({
    entityId: claim.entityId,
    userId: claim.userId,
    role: 'owner',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { success: true };
});

export const rejectClaim = functions.https.onCall(async (data, context) => {
  assertAdmin(context);
  const { claimId } = data as { claimId: string };
  if (!claimId) {
    throw new functions.https.HttpsError('invalid-argument', 'claimId is required');
  }

  await updateClaimStatus(claimId, 'rejected');
  return { success: true };
});

export const onOwnershipClaimCreate = functions.firestore
  .document('ownershipClaims/{claimId}')
  .onCreate(async (snapshot, context) => {
    const claim = snapshot.data() as OwnershipClaim;
    functions.logger.info('New ownership claim', { claimId: context.params.claimId, claim });
  });
