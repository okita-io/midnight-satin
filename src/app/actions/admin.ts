"use server";

import { checkAdminSession } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import {
  createAuthor,
  createSeries,
  createNovel,
  createChapter,
  createCharacter,
  updateContent,
  adjustUserCredits,
  hideComment,
  restoreComment,
  type CreateAuthorParams,
  type CreateSeriesParams,
  type CreateNovelParams,
  type CreateChapterParams,
  type CreateCharacterParams,
  type UpdateContentParams,
} from "@/lib/admin/admin-data";

export async function createAuthorAction(
  params: CreateAuthorParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await createAuthor(params);
  if ("id" in result) return { success: true, id: result.id };
  return { success: false, error: result.message };
}

export async function createSeriesAction(
  params: CreateSeriesParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await createSeries(params);
  if ("id" in result) return { success: true, id: result.id };
  return { success: false, error: result.message };
}

export async function createNovelAction(
  params: CreateNovelParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await createNovel(params);
  if ("id" in result) return { success: true, id: result.id };
  return { success: false, error: result.message };
}

export async function createChapterAction(
  params: CreateChapterParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await createChapter(params);
  if ("id" in result) return { success: true, id: result.id };
  return { success: false, error: result.message };
}

export async function createCharacterAction(
  params: CreateCharacterParams
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await createCharacter(params);
  if ("id" in result) return { success: true, id: result.id };
  return { success: false, error: result.message };
}

export async function updateContentAction(
  params: UpdateContentParams
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  const result = await updateContent(params);
  if ("success" in result) return { success: true };
  return { success: false, error: result.message };
}

export async function adjustCreditsAction(
  readerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  return adjustUserCredits(readerId, amount, reason);
}

export async function hideCommentAction(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  return hideComment(commentId);
}

export async function restoreCommentAction(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  const err = checkAdminSession(session);
  if (err) return err;
  return restoreComment(commentId);
}
