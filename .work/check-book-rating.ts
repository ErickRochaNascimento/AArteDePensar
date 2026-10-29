import assert from "node:assert/strict";
import { validateBook } from "../src/lib/book-input";
import { ageRatingLabel } from "../src/lib/book-rating";

const base = {
  title: "Livro teste",
  authorId: "autor-1",
  year: "2024",
  category: "Romance",
  pages: "120",
  price: "24,90",
  synopsis: "Uma sinopse suficientemente longa para validar.",
  ageRating: "",
};
const allowed = ["LIVRE", "MAIS_12", "MAIS_14", "MAIS_16", "MAIS_18"];

for (const ageRating of allowed) {
  const result = validateBook({ ...base, ageRating }, new Set(["autor-1"]));
  assert.ok("data" in result, `faixa rejeitada: ${ageRating}`);
  assert.equal(result.data.ageRating, ageRating);
}

const invalid = validateBook({ ...base, ageRating: "MAIS_21" }, new Set(["autor-1"]));
assert.ok("errors" in invalid && invalid.errors.ageRating);
assert.equal(ageRatingLabel(null), "Classificação indicativa pendente");
console.log("Validação etária aprovada: cinco valores aceitos, inválido rejeitado e pendência rotulada.");
