export const BOOK_AGE_RATINGS = [
  { value: "LIVRE", label: "Livre" },
  { value: "MAIS_12", label: "+12" },
  { value: "MAIS_14", label: "+14" },
  { value: "MAIS_16", label: "+16" },
  { value: "MAIS_18", label: "+18" },
] as const;

export type BookAgeRating = (typeof BOOK_AGE_RATINGS)[number]["value"];

export function isBookAgeRating(value: string): value is BookAgeRating {
  return BOOK_AGE_RATINGS.some((rating) => rating.value === value);
}

export function ageRatingLabel(value: string | null | undefined) {
  return BOOK_AGE_RATINGS.find((rating) => rating.value === value)?.label
    ?? "Classificação indicativa pendente";
}
