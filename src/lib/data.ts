// Dados de exemplo (livros e autores fictícios).
// Na Entrega 2/3 isto passa a vir do banco MySQL via Prisma.

export type Book = {
  id: number;
  slug: string;
  title: string;
  author: string;
  authorSlug: string;
  year: number;
  price: number;
  category: string;
  pages: number;
  rating: number;
  reviewCount: number;
  synopsis: string;
  c1: string;
  c2: string;
};

export type Author = {
  name: string;
  slug: string;
  color: string;
  bio: string;
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
export const formatBRL = (value: number) => brl.format(value);

export const AUTHORS: Author[] = [
  {
    name: "Helena Sarmento",
    color: "#1F4E5F",
    bio: "Nascida em Salvador, escreve romances sobre cidades de água e famílias que se separam e se encontram. Publicou quatro livros e mantém uma oficina de escrita no Pelourinho.",
  },
  {
    name: "Tiago Albuquerque",
    color: "#7A3B2E",
    bio: "Cronista do Recôncavo, escreve sobre feiras, quintais e a memória das cidades pequenas. Também organiza saraus de leitura.",
  },
  {
    name: "Marina Teles",
    color: "#2B2F6B",
    bio: "Engenheira de software e escritora. Escreve sobre tecnologia do dia a dia e sobre como manter o foco em um mundo cheio de notificações.",
  },
  {
    name: "Davi Nogueira",
    color: "#5B2A66",
    bio: "Autor de ficção especulativa com cenários de cidades alagadas e futuros incertos.",
  },
  {
    name: "Lia Camargo",
    color: "#14604A",
    bio: "Poeta e ensaísta, estreando no catálogo da livraria.",
  },
  {
    name: "Otávio Brandão",
    color: "#8A6A12",
    bio: "Historiador e escritor, pesquisa a vida cotidiana nos portos brasileiros.",
  },
].map((a) => ({ ...a, slug: slugify(a.name) }));

type BookSeed = Omit<Book, "slug" | "authorSlug">;

const SEEDS: BookSeed[] = [
  {
    id: 0,
    title: "O Farol de Santo Amaro",
    author: "Helena Sarmento",
    year: 2023,
    price: 24.9,
    category: "Romance",
    pages: 312,
    rating: 4.6,
    reviewCount: 128,
    synopsis:
      "Na manhã em que o último barco deixou o cais, uma carta antiga reaparece no fundo de uma gaveta. A partir dela, a narradora refaz o caminho da família entre a cidade e o mar, revendo o que ficou dito e o que ficou calado.",
    c1: "#1F4E5F",
    c2: "#2F7A8C",
  },
  {
    id: 1,
    title: "Cartas para o Recôncavo",
    author: "Tiago Albuquerque",
    year: 2021,
    price: 19.9,
    category: "Crônicas",
    pages: 198,
    rating: 4.4,
    reviewCount: 64,
    synopsis:
      "Crônicas escritas em forma de carta a uma região que o autor nunca deixou de habitar, mesmo morando longe dela.",
    c1: "#7A3B2E",
    c2: "#A85A3F",
  },
  {
    id: 2,
    title: "Algoritmos em Casa",
    author: "Marina Teles",
    year: 2024,
    price: 39.9,
    category: "Tecnologia",
    pages: 276,
    rating: 4.7,
    reviewCount: 211,
    synopsis:
      "Como pensar de forma algorítmica nas tarefas domésticas, sem precisar saber programar. Exemplos práticos e exercícios curtos.",
    c1: "#2B2F6B",
    c2: "#4650B5",
  },
  {
    id: 3,
    title: "Maré Alta",
    author: "Helena Sarmento",
    year: 2019,
    price: 17.5,
    category: "Romance",
    pages: 244,
    rating: 4.5,
    reviewCount: 97,
    synopsis:
      "Uma família de pescadores enfrenta o verão em que o mar avançou além do previsto, e cada um precisa decidir se fica ou parte.",
    c1: "#14604A",
    c2: "#2E9C74",
  },
  {
    id: 4,
    title: "Fome de Horizonte",
    author: "Davi Nogueira",
    year: 2022,
    price: 29.9,
    category: "Ficção",
    pages: 330,
    rating: 4.3,
    reviewCount: 82,
    synopsis:
      "Em um futuro de rotas interrompidas, uma tripulação improvisada procura o último horizonte ainda navegável.",
    c1: "#5B2A66",
    c2: "#8D4A9B",
  },
  {
    id: 5,
    title: "Pequeno Manual de Foco",
    author: "Marina Teles",
    year: 2020,
    price: 14.9,
    category: "Não ficção",
    pages: 120,
    rating: 4.2,
    reviewCount: 156,
    synopsis:
      "Um guia curto e direto com hábitos simples para concentrar a atenção no que importa.",
    c1: "#8A6A12",
    c2: "#C79A22",
  },
  {
    id: 6,
    title: "A Cidade Submersa",
    author: "Davi Nogueira",
    year: 2018,
    price: 22.0,
    category: "Ficção",
    pages: 288,
    rating: 4.4,
    reviewCount: 73,
    synopsis:
      "Mergulhadores encontram, sob a baía, ruas inteiras que ninguém lembra de ter construído.",
    c1: "#1B3A57",
    c2: "#2A6A9E",
  },
  {
    id: 7,
    title: "Receitas de Quintal",
    author: "Tiago Albuquerque",
    year: 2025,
    price: 34.9,
    category: "Culinária",
    pages: 164,
    rating: 4.8,
    reviewCount: 39,
    synopsis:
      "Receitas de família feitas com o que o quintal oferece, contadas com as histórias de quem as cozinhava.",
    c1: "#6B3A1A",
    c2: "#B8692B",
  },
];

export const BOOKS: Book[] = SEEDS.map((b) => ({
  ...b,
  slug: slugify(b.title),
  authorSlug: slugify(b.author),
}));

export const CATEGORIES = ["Todos", ...Array.from(new Set(BOOKS.map((b) => b.category)))];

export const getBook = (slug: string) => BOOKS.find((b) => b.slug === slug);
export const getAuthor = (slug: string) => AUTHORS.find((a) => a.slug === slug);
export const booksByAuthor = (authorSlug: string) =>
  BOOKS.filter((b) => b.authorSlug === authorSlug);

export const REVIEWS = [
  {
    name: "Camila R.",
    stars: 5,
    text: "Li em dois dias no leitor do site e depois baixei o EPUB para o celular.",
  },
  {
    name: "Rafael M.",
    stars: 4,
    text: "Prosa cuidadosa. O final poderia ser mais ousado, mas vale a leitura.",
  },
];

export const RATING_DISTRIBUTION: [number, number][] = [
  [5, 68],
  [4, 22],
  [3, 6],
  [2, 3],
  [1, 1],
];
