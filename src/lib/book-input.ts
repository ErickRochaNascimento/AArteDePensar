import { slugify } from "@/lib/data";

// Validação dos campos de livro no servidor (usada pelas ações do Admin).

export type BookFormValues = {
  title: string;
  authorId: string;
  year: string;
  category: string;
  pages: string;
  price: string;
  synopsis: string;
};

export type BookInput = {
  title: string;
  authorId: string;
  year: number;
  category: string;
  pages: number;
  price: string; // "24.90", pronto para o Decimal do Prisma
  synopsis: string;
};

export type BookFieldErrors = Partial<Record<keyof BookFormValues, string>>;

export const EMPTY_BOOK_VALUES: BookFormValues = {
  title: "",
  authorId: "",
  year: "",
  category: "",
  pages: "",
  price: "",
  synopsis: "",
};

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readBookValues(formData: FormData): BookFormValues {
  return {
    title: text(formData, "title"),
    authorId: text(formData, "authorId"),
    year: text(formData, "year"),
    category: text(formData, "category"),
    pages: text(formData, "pages"),
    price: text(formData, "price"),
    synopsis: text(formData, "synopsis"),
  };
}

/** Aceita "24,90", "24.90" e "1.234,50". Devolve "24.90" ou null. */
export function parsePrice(raw: string): string | null {
  let value = raw.replace(/\s|R\$/g, "");
  if (!value) return null;
  if (value.includes(",")) value = value.replace(/\./g, "").replace(",", ".");
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(value)) return null;
  const number = Number(value);
  if (!(number > 0) || number > 9999.99) return null;
  return number.toFixed(2);
}

function parseInteger(raw: string) {
  return /^\d{1,5}$/.test(raw) ? Number(raw) : null;
}

export function validateBook(
  values: BookFormValues,
  knownAuthorIds: Set<string>,
  now = new Date(),
): { data: BookInput } | { errors: BookFieldErrors } {
  const errors: BookFieldErrors = {};

  if (values.title.length < 2 || values.title.length > 160) {
    errors.title = "Informe um título entre 2 e 160 caracteres.";
  } else if (!slugify(values.title)) {
    errors.title = "O título precisa ter letras ou números.";
  }

  if (!knownAuthorIds.has(values.authorId)) {
    errors.authorId = "Selecione um autor da lista.";
  }

  const year = parseInteger(values.year);
  const maxYear = now.getFullYear() + 1;
  if (year === null || year < 1000 || year > maxYear) {
    errors.year = `Informe um ano entre 1000 e ${maxYear}.`;
  }

  if (values.category.length < 2 || values.category.length > 60) {
    errors.category = "Informe uma categoria entre 2 e 60 caracteres.";
  }

  const pages = parseInteger(values.pages);
  if (pages === null || pages < 1 || pages > 20000) {
    errors.pages = "Informe o número de páginas (1 a 20000).";
  }

  const price = parsePrice(values.price);
  if (price === null) {
    errors.price = "Informe um preço válido, por exemplo 24,90 (até 9999,99).";
  }

  if (values.synopsis.length < 10 || values.synopsis.length > 4000) {
    errors.synopsis = "Escreva uma sinopse entre 10 e 4000 caracteres.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  return {
    data: {
      title: values.title,
      authorId: values.authorId,
      year: year as number,
      category: values.category,
      pages: pages as number,
      price: price as string,
      synopsis: values.synopsis,
    },
  };
}

export function bookSlugFromTitle(title: string) {
  return slugify(title).slice(0, 160);
}
