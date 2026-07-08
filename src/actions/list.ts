"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { hexclaveServerApp } from "@/hexclave/server";
import { createListSchema, updateListSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/slug";

function getOwnerGuard() {
  return hexclaveServerApp.getUser();
}

export async function createList(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const user = await getOwnerGuard();
  if (!user) return { error: "Nicht eingeloggt" };

  const raw = Object.fromEntries(formData);
  const parsed = createListSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Bitte alle Pflichtfelder ausfüllen" };
  }

  const { eventDate, ...rest } = parsed.data;

  const slug = generateSlug();

  const list = await db.giftList.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      slug,
      ...rest,
      eventDate: eventDate ? new Date(eventDate) : null,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/liste/${list.slug}/verwalten`);
}

export async function getListBySlug(slug: string) {
  const list = await db.giftList.findUnique({
    where: { slug },
  });
  return list || null;
}

export async function getUserLists() {
  const user = await getOwnerGuard();
  if (!user) return [];

  const lists = await db.giftList.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return lists;
}

export async function updateList(
  listId: string,
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const user = await getOwnerGuard();
  if (!user) throw new Error("Nicht eingeloggt");

  const list = await db.giftList.findUnique({
    where: { id: listId },
  });
  if (!list || list.userId !== user.id) throw new Error("Keine Berechtigung");

  const raw = Object.fromEntries(formData);
  const parsed = updateListSchema.safeParse(raw);
  if (!parsed.success) return { error: "Ungültige Eingabe" };

  const { eventDate, invitationHeadline, invitationMessage, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };
  if (eventDate) updateData.eventDate = new Date(eventDate);
  if (invitationHeadline !== undefined) updateData.invitationHeadline = invitationHeadline || null;
  if (invitationMessage !== undefined) updateData.invitationMessage = invitationMessage || null;

  await db.giftList.update({
    where: { id: listId },
    data: updateData as any,
  });

  revalidatePath(`/liste/${list.slug}/verwalten`);
  revalidatePath(`/liste/${list.slug}`);
  return null;
}

export async function deleteList(listId: string) {
  const user = await getOwnerGuard();
  if (!user) throw new Error("Nicht eingeloggt");

  const list = await db.giftList.findUnique({
    where: { id: listId },
  });
  if (!list || list.userId !== user.id) throw new Error("Keine Berechtigung");

  await db.giftList.delete({
    where: { id: listId },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
