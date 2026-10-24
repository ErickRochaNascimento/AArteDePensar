"use client";

import { useMemo, useSyncExternalStore } from "react";
import { BOOKS, type Book } from "@/lib/data";

// Carrinho no navegador: guarda só os slugs dos livros em localStorage e
// compartilha o estado entre todos os componentes (useSyncExternalStore).
// Os preços finais devem sempre ser recalculados no servidor na Entrega 5.

const STORAGE_KEY = "aartedepensar:cart";
const EMPTY: string[] = [];

let snapshot: string[] = EMPTY;
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
        snapshot = parsed.filter((s): s is string => typeof s === "string");
      }
    }
  } catch {
    // localStorage indisponível: segue sem persistência
  }
}

function setSnapshot(next: string[]) {
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
    if (!snapshot.includes(book.slug)) setSnapshot([...snapshot, book.slug]);
  },
  replaceWith: (book: Book) => setSnapshot([book.slug]),
  remove: (slug: string) => setSnapshot(snapshot.filter((s) => s !== slug)),
  clear: () => setSnapshot([]),
};

export function useCart() {
  const slugs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(
    () =>
      slugs
        .map((slug) => BOOKS.find((b) => b.slug === slug))
        .filter((b): b is Book => Boolean(b)),
    [slugs],
  );
  return { items, ...actions };
}
