import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

type ReviewStatus = 'published' | 'pending' | 'flagged' | 'deleted';

type ReviewDocument = {
  entityId: string;
  rating: number;
  status: ReviewStatus;
  createdAt: admin.firestore.Timestamp;
  updatedAt: admin.firestore.Timestamp;
};

function shouldCount(status: ReviewStatus): boolean {
  return status === 'published';
}

async function adjustEntityAggregates(
  entityId: string,
  ratingDelta: number,
  countDelta: number,
  lastReviewAt?: admin.firestore.Timestamp
): Promise<void> {
  const entityRef = db.collection('entities').doc(entityId);
  await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(entityRef);
    if (!snapshot.exists) {
      return;
    }
    const data = snapshot.data() ?? {};
    const ratingSum = (data.ratingSum ?? 0) + ratingDelta;
    const ratingCount = (data.ratingCount ?? 0) + countDelta;
    const safeCount = ratingCount < 0 ? 0 : ratingCount;
    const safeSum = ratingSum < 0 ? 0 : ratingSum;
    const ratingAverage = safeCount === 0 ? 0 : parseFloat((safeSum / safeCount).toFixed(2));
    tx.update(entityRef, {
      ratingSum: safeSum,
      ratingCount: safeCount,
      ratingAverage,
      lastReviewAt: lastReviewAt ?? admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
}

export const onReviewCreate = functions.firestore.document('reviews/{reviewId}').onCreate(async (snapshot) => {
  const review = snapshot.data() as ReviewDocument;
  if (!shouldCount(review.status)) {
    return;
  }
  await adjustEntityAggregates(review.entityId, review.rating, 1, review.createdAt);
});

export const onReviewUpdate = functions.firestore.document('reviews/{reviewId}').onUpdate(async (change) => {
  const before = change.before.data() as ReviewDocument;
  const after = change.after.data() as ReviewDocument;

  const wasCounted = shouldCount(before.status);
  const willCount = shouldCount(after.status);

  if (!wasCounted && !willCount) {
    return;
  }

  if (wasCounted && !willCount) {
    await adjustEntityAggregates(before.entityId, -before.rating, -1);
    return;
  }

  if (!wasCounted && willCount) {
    await adjustEntityAggregates(after.entityId, after.rating, 1, after.updatedAt);
    return;
  }

  if (before.rating !== after.rating) {
    const delta = after.rating - before.rating;
    await adjustEntityAggregates(after.entityId, delta, 0, after.updatedAt);
  }
});

export const onReviewDelete = functions.firestore.document('reviews/{reviewId}').onDelete(async (snapshot) => {
  const review = snapshot.data() as ReviewDocument;
  if (!shouldCount(review.status)) {
    return;
  }
  await adjustEntityAggregates(review.entityId, -review.rating, -1);
});
