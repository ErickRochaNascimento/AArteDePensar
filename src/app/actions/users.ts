"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";

type UserRole = "USER" | "EMPLOYEE" | "ADMIN";
const VALID_ROLES: UserRole[] = ["USER", "EMPLOYEE", "ADMIN"];

export async function updateUserRoleAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId");
  const requestedRole = formData.get("role");
  if (typeof userId !== "string" || !userId || typeof requestedRole !== "string" || !VALID_ROLES.includes(requestedRole as UserRole)) {
    redirect("/admin/usuarios?notice=entrada-invalida");
  }
  const role = requestedRole as UserRole;

  type Outcome = "updated" | "missing" | "self" | "last-admin" | "unchanged" | "error";
  let outcome: Outcome;
  try {
    outcome = await getDb().$transaction(async (tx): Promise<Outcome> => {
      const target = await tx.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
      if (!target) return "missing";
      if (target.role === role) return "unchanged";
      if (target.id === admin.id) return "self";
      if (target.role === "ADMIN" && role !== "ADMIN") {
        const adminCount = await tx.user.count({ where: { role: "ADMIN" } });
        if (adminCount <= 1) return "last-admin";
      }
      await tx.user.update({ where: { id: userId }, data: { role }, select: { id: true } });
      return "updated";
    }, { isolationLevel: "Serializable" });
  } catch {
    outcome = "error";
  }

  if (outcome === "updated") {
    revalidatePath("/admin/usuarios");
    revalidatePath("/admin");
    redirect("/admin/usuarios?notice=atualizado");
  }
  redirect(`/admin/usuarios?notice=${outcome}`);
}
