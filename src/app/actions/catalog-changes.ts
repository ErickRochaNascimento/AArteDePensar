"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { readBookValues, validateBook } from "@/lib/book-input";
import { slugify } from "@/lib/data";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function objectPayload(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function revalidateCatalog() {
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/livro/[slug]", "page");
  revalidatePath("/autor/[slug]", "page");
}

export async function reviewCatalogChangeAction(formData: FormData) {
  const reviewer = await requireAdmin();
  const id = formData.get("id");
  const decision = formData.get("decision");
  if (typeof id !== "string" || !id || (decision !== "approve" && decision !== "reject")) {
    redirect("/admin?notice=proposta-invalida");
  }

  type ReviewResult = {
    outcome: "approved" | "rejected" | "stale" | "invalid" | "error";
    anchor: "#livros" | "#autores";
  };
  let result: ReviewResult;
  try {
    result = await getDb().$transaction(async (tx): Promise<ReviewResult> => {
      const change = await tx.catalogChange.findUnique({ where: { id } });
      const anchor = change?.entityType === "AUTHOR" ? "#autores" : "#livros";
      if (!change || change.status !== "PENDING") {
        return { outcome: "stale", anchor };
      }

      if (decision === "reject") {
        const claimed = await tx.catalogChange.updateMany({
          where: { id, status: "PENDING" },
          data: { status: "REJECTED", reviewedById: reviewer.id, reviewedAt: new Date() },
        });
        return { outcome: claimed.count === 1 ? "rejected" : "stale", anchor };
      }

      const payload = objectPayload(change.payload);
      if (!payload) return { outcome: "invalid", anchor };

      if (change.entityType === "BOOK") {
        const submission = new FormData();
        for (const key of ["title", "authorId", "year", "category", "pages", "price", "synopsis", "ageRating"]) {
          const value = payload[key];
          if (typeof value === "string" || typeof value === "number") submission.set(key, String(value));
        }
        const values = readBookValues(submission);
        const authorIds = await tx.author.findMany({ select: { id: true } });
        const validation = validateBook(values, new Set(authorIds.map((author) => author.id)));
        if ("errors" in validation) return { outcome: "invalid", anchor };
        const existingBook = await tx.book.findUnique({ where: { id: change.entityId }, select: { published: true } });
        if (!existingBook) return { outcome: "invalid", anchor };
        if (existingBook.published) {
          const author = await tx.author.findUnique({ where: { id: validation.data.authorId }, select: { published: true } });
          if (!author?.published) return { outcome: "invalid", anchor };
        }
        const claimed = await tx.catalogChange.updateMany({
          where: { id, status: "PENDING" },
          data: { status: "APPROVED", reviewedById: reviewer.id, reviewedAt: new Date() },
        });
        if (claimed.count !== 1) return { outcome: "stale", anchor };
        await tx.book.update({ where: { id: change.entityId }, data: validation.data, select: { id: true } });
      } else {
        const name = text(payload.name);
        const bio = text(payload.bio);
        const color = text(payload.color);
        if (name.length < 2 || name.length > 120 || !slugify(name) || bio.length < 10 || bio.length > 4000 || !HEX_COLOR.test(color)) {
          return { outcome: "invalid", anchor };
        }
        const existingAuthor = await tx.author.findUnique({ where: { id: change.entityId }, select: { id: true } });
        if (!existingAuthor) return { outcome: "invalid", anchor };
        const claimed = await tx.catalogChange.updateMany({
          where: { id, status: "PENDING" },
          data: { status: "APPROVED", reviewedById: reviewer.id, reviewedAt: new Date() },
        });
        if (claimed.count !== 1) return { outcome: "stale", anchor };
        await tx.author.update({
          where: { id: change.entityId },
          data: { name, bio, color },
          select: { id: true },
        });
      }
      return { outcome: "approved", anchor };
    });
  } catch {
    result = { outcome: "error", anchor: "#livros" };
  }

  if (result.outcome === "stale") redirect(`/admin?notice=proposta-ja-analisada${result.anchor}`);
  if (result.outcome === "invalid") redirect(`/admin?notice=proposta-invalida${result.anchor}`);
  if (result.outcome === "error") redirect(`/admin?notice=erro-na-proposta${result.anchor}`);
  revalidateCatalog();
  redirect(`/admin?notice=${result.outcome === "approved" ? "proposta-aprovada" : "proposta-rejeitada"}${result.anchor}`);
}
