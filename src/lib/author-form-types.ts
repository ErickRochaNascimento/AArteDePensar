export type AuthorFormValues = {
  name: string;
  bio: string;
  color: string;
};

export type AuthorFormState = {
  values?: AuthorFormValues;
  fieldErrors?: Partial<Record<keyof AuthorFormValues, string>>;
  error?: string;
  success?: string;
  savedAuthor?: { id: string; name: string; slug: string; bio: string; color: string };
};
