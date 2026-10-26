import type { BookFieldErrors, BookFormValues } from "@/lib/book-input";

export type SavedBook = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
  hasEbook: boolean;
  ebookMimeType: string | null;
  ebookOriginalName: string | null;
  ebookSize: number | null;
};

export type BookFormState = {
  error?: string;
  success?: string;
  fieldErrors?: BookFieldErrors;
  values?: BookFormValues;
  savedBook?: SavedBook;
};
