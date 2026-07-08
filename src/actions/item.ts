"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { hexclaveServerApp } from "@/hexclave/server";
import { addItemSchema } from "@/lib/validations";
import { cleanAmazonUrl } from "@/lib/amazon";

function getOwnerGuard() {
  return hexclaveServerApp.getUser();
}

async function verifyOwner(listId: string) {
  const user = await getOwnerGuard();
  if (!user) throw new Error("Nicht eingeloggt");

  const list = await db.giftList.findUnique({
    where: { id: listId },
  });
  if (!list || list.userId !== user.id)
    throw new Error("Keine Berechtigung");
  return list;
}

export async function addItem(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const raw = Object.fromEntries(formData);
  const parsed = addItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Bitte alle Felder ausfüllen" };
  }

  let { listId, url, title, imageUrl, price } = parsed.data;

  url = cleanAmazonUrl(url);

  const list = await verifyOwner(listId);

  const existing = await db.giftItem.findFirst({
    where: { listId, url },
  });
  if (existing) {
    return { error: "Dieses Produkt ist bereits in der Liste" };
  }

  const maxOrder = await db.giftItem.findFirst({
    where: { listId },
    orderBy: { sortOrder: "desc" },
  });

  await db.giftItem.create({
    data: {
      id: crypto.randomUUID(),
      listId,
      url,
      title,
      imageUrl: imageUrl || null,
      price: price || null,
      sortOrder: (maxOrder?.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath(`/liste/${list.slug}`);
  revalidatePath(`/liste/${list.slug}/verwalten`);
  return null;
}

export async function deleteItem(itemId: string) {
  const item = await db.giftItem.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error("Item nicht gefunden");

  await verifyOwner(item.listId);
  await db.giftItem.delete({
    where: { id: itemId },
  });

  const list = await db.giftList.findUnique({
    where: { id: item.listId },
  });
  if (list) {
    revalidatePath(`/liste/${list.slug}`);
    revalidatePath(`/liste/${list.slug}/verwalten`);
  }
}

export async function updateItem(itemId: string, formData: FormData) {
  const item = await db.giftItem.findUnique({
    where: { id: itemId },
  });
  if (!item) throw new Error("Item nicht gefunden");

  await verifyOwner(item.listId);

  const title = formData.get("title") as string;
  const imageUrl = formData.get("imageUrl") as string;
  const price = formData.get("price") as string;

  await db.giftItem.update({
    where: { id: itemId },
    data: {
      title: title || item.title,
      imageUrl: imageUrl || item.imageUrl,
      price: price || item.price,
    },
  });

  const list = await db.giftList.findUnique({
    where: { id: item.listId },
  });
  if (list) {
    revalidatePath(`/liste/${list.slug}`);
    revalidatePath(`/liste/${list.slug}/verwalten`);
  }
}
