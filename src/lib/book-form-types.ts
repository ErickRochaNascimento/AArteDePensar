import type { BookFieldErrors, BookFormValues } from "@/lib/book-input";

export type BookFormState = {
  error?: string;
  fieldErrors?: BookFieldErrors;
  values?: BookFormValues;
};
