import "server-only";

import { getDb } from "@/lib/db";
import type { BookAgeRating } from "@/lib/book-rating";

export type CatalogChangePayload = {
  title?: string;
  authorId?: string;
  year?: number;
  category?: string;
  pages?: number;
  price?: string;
  synopsis?: string;
  ageRating?: BookAgeRating;
  name?: string;
  bio?: string;
  color?: string;
};

export type PendingCatalogChange = {
  id: string;
  entityType: "BOOK" | "AUTHOR";
  entityId: string;
  payload: CatalogChangePayload;
  submittedAt: string;
  submittedBy: { name: string; email: string };
};

export async function listPendingCatalogChanges(
  entityType: "BOOK" | "AUTHOR",
): Promise<PendingCatalogChange[]> {
  const rows = await getDb().catalogChange.findMany({
    where: { entityType, status: "PENDING" },
    select: {
      id: true,
      entityType: true,
      entityId: true,
      payload: true,
      submittedAt: true,
      submittedBy: { select: { name: true, email: true } },
    },
    orderBy: { submittedAt: "asc" },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    entityType: row.entityType,
    entityId: row.entityId,
    payload: row.payload as unknown as CatalogChangePayload,
    submittedAt: row.submittedAt.toISOString(),
    submittedBy: row.submittedBy,
  }));
}
