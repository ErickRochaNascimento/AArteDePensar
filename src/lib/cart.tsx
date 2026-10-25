"use client";

import { useSyncExternalStore } from "react";
import type { Book } from "@/lib/data";

// Carrinho no navegador (demonstrativo): guarda em localStorage apenas os dados
// de EXIBIÇÃO do livro e compartilha o estado entre os componentes
// (useSyncExternalStore). O navegador não é fonte confiável de preço: na
// Entrega 5 o servidor recalcula valores a partir dos slugs, no banco.

export type CartItem = Pick<
  Book,
  "id" | "slug" | "title" | "author" | "category" | "price" | "c1" | "c2"
>;

const STORAGE_KEY = "aartedepensar:cart:v2";
const EMPTY: CartItem[] = [];

function toCartItem(book: Book): CartItem {
  const { id, slug, title, author, category, price, c1, c2 } = book;
  return { id, slug, title, author, category, price, c1, c2 };
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.author === "string" &&
    typeof v.category === "string" &&
    typeof v.price === "number" &&
    Number.isFinite(v.price) &&
    typeof v.c1 === "string" &&
    typeof v.c2 === "string"
  );
}

let snapshot: CartItem[] = EMPTY;
let initialized = false;
const listeners = new Set<() => void>();

function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        snapshot = parsed.filter(isCartItem);
      }
    }
  } catch {
    // localStorage indisponível: segue sem persistência
  }
}

function setSnapshot(next: CartItem[]) {
  snapshot = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignora
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  init();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  init();
  return snapshot;
}

const getServerSnapshot = () => EMPTY;

const actions = {
  add: (book: Book) => {
    if (!snapshot.some((item) => item.slug === book.slug)) {
      setSnapshot([...snapshot, toCartItem(book)]);
    }
  },
  replaceWith: (book: Book) => setSnapshot([toCartItem(book)]),
  remove: (slug: string) => setSnapshot(snapshot.filter((item) => item.slug !== slug)),
  clear: () => setSnapshot([]),
};

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { items, ...actions };
}
