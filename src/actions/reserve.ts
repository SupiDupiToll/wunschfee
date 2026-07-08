"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { reserveSchema } from "@/lib/validations";

export async function reserveItem(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const raw = Object.fromEntries(formData);
  const parsed = reserveSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Bitte gib deinen Namen ein" };
  }

  const { itemId, name } = parsed.data;

  const item = await db.giftItem.findUnique({
    where: { id: itemId },
  });
  if (!item) return { error: "Geschenk nicht gefunden" };
  if (item.isReserved) return { error: "Bereits reserviert" };

  await db.giftItem.update({
    where: { id: itemId },
    data: {
      isReserved: true,
      reservedBy: name,
      reservedAt: new Date(),
    },
  });

  const list = await db.giftList.findUnique({
    where: { id: item.listId },
  });
  if (list) {
    revalidatePath(`/liste/${list.slug}`);
  }
  return null;
}

export async function unreserveItem(itemId: string) {
  const item = await db.giftItem.findUnique({
    where: { id: itemId },
  });
  if (!item) return { error: "Geschenk nicht gefunden" };

  await db.giftItem.update({
    where: { id: itemId },
    data: {
      isReserved: false,
      reservedBy: null,
      reservedAt: null,
    },
  });

  const list = await db.giftList.findUnique({
    where: { id: item.listId },
  });
  if (list) {
    revalidatePath(`/liste/${list.slug}/verwalten`);
  }
}
