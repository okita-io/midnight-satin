"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  validateNovelReviewContent,
  isValidStarRating,
} from "@/lib/reviews/validation";
import {
  getReaderNovelReviewDb,
  insertNovelReviewDb,
  updateNovelReviewDb,
  deleteNovelReviewDb,
} from "@/lib/db/novel-reviews";

export type PostNovelReviewResult =
  | { success: true }
  | { success: false; error: string };

export type UpdateNovelReviewResult =
  | { success: true }
  | { success: false; error: string };

export type DeleteNovelReviewResult =
  | { success: true }
  | { success: false; error: string };

export async function postNovelReview(
  novelId: string,
  content: string,
  starRating: number
): Promise<PostNovelReviewResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to write a review." };
  }

  const validation = validateNovelReviewContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  if (!isValidStarRating(starRating)) {
    return { success: false, error: "Choose a star rating from 1 to 5." };
  }

  const trimmed = content.trim();
  const existing = await getReaderNovelReviewDb(novelId, session.readerId);
  if (existing) {
    return {
      success: false,
      error: "You already have a review. Save changes to update it.",
    };
  }

  try {
    await insertNovelReviewDb(novelId, session.readerId, trimmed, starRating);
  } catch (e) {
    console.error("postNovelReview:", e);
    return { success: false, error: "Could not post your review. Try again." };
  }

  revalidatePath(`/novel/${novelId}`);
  revalidatePath(`/novel/${novelId}/reviews`);
  return { success: true };
}

export async function updateNovelReview(
  novelId: string,
  reviewId: string,
  content: string,
  starRating: number
): Promise<UpdateNovelReviewResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to edit your review." };
  }

  const validation = validateNovelReviewContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  if (!isValidStarRating(starRating)) {
    return { success: false, error: "Choose a star rating from 1 to 5." };
  }

  const trimmed = content.trim();
  const existing = await getReaderNovelReviewDb(novelId, session.readerId);
  if (!existing || existing.id !== reviewId) {
    return { success: false, error: "Review not found." };
  }

  try {
    await updateNovelReviewDb(reviewId, session.readerId, trimmed, starRating);
  } catch (e) {
    console.error("updateNovelReview:", e);
    return { success: false, error: "Could not update your review. Try again." };
  }

  revalidatePath(`/novel/${novelId}`);
  revalidatePath(`/novel/${novelId}/reviews`);
  return { success: true };
}

export async function deleteNovelReview(
  novelId: string,
  reviewId: string
): Promise<DeleteNovelReviewResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please sign in to remove your review." };
  }

  const existing = await getReaderNovelReviewDb(novelId, session.readerId);
  if (!existing || existing.id !== reviewId) {
    return { success: false, error: "Review not found." };
  }

  try {
    const deleted = await deleteNovelReviewDb(reviewId, session.readerId);
    if (!deleted) {
      return { success: false, error: "Could not remove that review." };
    }
  } catch (e) {
    console.error("deleteNovelReview:", e);
    return { success: false, error: "Could not remove your review. Try again." };
  }

  revalidatePath(`/novel/${novelId}`);
  revalidatePath(`/novel/${novelId}/reviews`);
  return { success: true };
}
