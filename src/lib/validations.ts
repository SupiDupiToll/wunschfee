import { z } from "zod";

export const createListSchema = z.object({
  title: z.string().min(2, "Titel muss mindestens 2 Zeichen haben").max(100),
  honoreeName: z
    .string()
    .min(2, "Name muss mindestens 2 Zeichen haben")
    .max(100),
  birthdayLabel: z.string().max(100).optional(),
  eventDate: z.string().optional(),
  message: z.string().max(500).optional(),
  accessType: z.enum(["public", "password"]),
  accessPassword: z.string().min(4).max(100).optional().catch(undefined),
});

export const updateListSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  honoreeName: z.string().min(2).max(100).optional(),
  birthdayLabel: z.string().max(100).optional(),
  eventDate: z.string().optional(),
  message: z.string().max(500).optional(),
  accessType: z.enum(["public", "password"]).optional(),
  accessPassword: z.string().min(4).max(100).optional().catch(undefined),
  hideReservations: z.boolean().optional(),
});

export const addItemSchema = z.object({
  listId: z.string(),
  url: z.string().url("Bitte gib eine gültige URL ein").max(2000),
  title: z.string().min(1, "Titel darf nicht leer sein").max(500),
  imageUrl: z.string().url().optional().or(z.literal("")),
  price: z.string().max(50).optional().or(z.literal("")),
});

export const reserveSchema = z.object({
  itemId: z.string(),
  name: z
    .string()
    .min(2, "Bitte gib deinen Namen ein")
    .max(100)
    .transform((s) => s.trim()),
});
