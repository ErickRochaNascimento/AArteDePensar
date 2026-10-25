// Metadados fictícios usados pelo seed (npm run db:seed). Não são arquivos de livros.
// Os livros de exemplo começam publicados, como no protótipo.

export type SeedAuthor = {
  slug: string;
  name: string;
  color: string;
  bio: string;
};

export type SeedBook = {
  slug: string;
  title: string;
  authorSlug: string;
  year: number;
  price: string;
  category: string;
  pages: number;
  rating: string;
  reviewCount: number;
  synopsis: string;
  c1: string;
  c2: string;
};

export const SEED_AUTHORS: SeedAuthor[] = [
  {
    slug: "helena-sarmento",
    name: "Helena Sarmento",
    color: "#1F4E5F",
    bio: "Nascida em Salvador, escreve romances sobre cidades de água e famílias que se separam e se encontram. Publicou quatro livros e mantém uma oficina de escrita no Pelourinho.",
  },
  {
    slug: "tiago-albuquerque",
    name: "Tiago Albuquerque",
    color: "#7A3B2E",
    bio: "Cronista do Recôncavo, escreve sobre feiras, quintais e a memória das cidades pequenas. Também organiza saraus de leitura.",
  },
  {
    slug: "marina-teles",
    name: "Marina Teles",
    color: "#2B2F6B",
    bio: "Engenheira de software e escritora. Escreve sobre tecnologia do dia a dia e sobre como manter o foco em um mundo cheio de notificações.",
  },
  {
    slug: "davi-nogueira",
    name: "Davi Nogueira",
    color: "#5B2A66",
    bio: "Autor de ficção especulativa com cenários de cidades alagadas e futuros incertos.",
  },
  {
    slug: "lia-camargo",
    name: "Lia Camargo",
    color: "#14604A",
    bio: "Poeta e ensaísta, estreando no catálogo da livraria.",
  },
  {
    slug: "otavio-brandao",
    name: "Otávio Brandão",
    color: "#8A6A12",
    bio: "Historiador e escritor, pesquisa a vida cotidiana nos portos brasileiros.",
  },
];

export const SEED_BOOKS: SeedBook[] = [
  {
    slug: "o-farol-de-santo-amaro",
    title: "O Farol de Santo Amaro",
    authorSlug: "helena-sarmento",
    year: 2023,
    price: "24.90",
    category: "Romance",
    pages: 312,
    rating: "4.6",
    reviewCount: 128,
    synopsis: "Na manhã em que o último barco deixou o cais, uma carta antiga reaparece no fundo de uma gaveta. A partir dela, a narradora refaz o caminho da família entre a cidade e o mar, revendo o que ficou dito e o que ficou calado.",
    c1: "#1F4E5F",
    c2: "#2F7A8C",
  },
  {
    slug: "cartas-para-o-reconcavo",
    title: "Cartas para o Recôncavo",
    authorSlug: "tiago-albuquerque",
    year: 2021,
    price: "19.90",
    category: "Crônicas",
    pages: 198,
    rating: "4.4",
    reviewCount: 64,
    synopsis: "Crônicas escritas em forma de carta a uma região que o autor nunca deixou de habitar, mesmo morando longe dela.",
    c1: "#7A3B2E",
    c2: "#A85A3F",
  },
  {
    slug: "algoritmos-em-casa",
    title: "Algoritmos em Casa",
    authorSlug: "marina-teles",
    year: 2024,
    price: "39.90",
    category: "Tecnologia",
    pages: 276,
    rating: "4.7",
    reviewCount: 211,
    synopsis: "Como pensar de forma algorítmica nas tarefas domésticas, sem precisar saber programar. Exemplos práticos e exercícios curtos.",
    c1: "#2B2F6B",
    c2: "#4650B5",
  },
  {
    slug: "mare-alta",
    title: "Maré Alta",
    authorSlug: "helena-sarmento",
    year: 2019,
    price: "17.50",
    category: "Romance",
    pages: 244,
    rating: "4.5",
    reviewCount: 97,
    synopsis: "Uma família de pescadores enfrenta o verão em que o mar avançou além do previsto, e cada um precisa decidir se fica ou parte.",
    c1: "#14604A",
    c2: "#2E9C74",
  },
  {
    slug: "fome-de-horizonte",
    title: "Fome de Horizonte",
    authorSlug: "davi-nogueira",
    year: 2022,
    price: "29.90",
    category: "Ficção",
    pages: 330,
    rating: "4.3",
    reviewCount: 82,
    synopsis: "Em um futuro de rotas interrompidas, uma tripulação improvisada procura o último horizonte ainda navegável.",
    c1: "#5B2A66",
    c2: "#8D4A9B",
  },
  {
    slug: "pequeno-manual-de-foco",
    title: "Pequeno Manual de Foco",
    authorSlug: "marina-teles",
    year: 2020,
    price: "14.90",
    category: "Não ficção",
    pages: 120,
    rating: "4.2",
    reviewCount: 156,
    synopsis: "Um guia curto e direto com hábitos simples para concentrar a atenção no que importa.",
    c1: "#8A6A12",
    c2: "#C79A22",
  },
  {
    slug: "a-cidade-submersa",
    title: "A Cidade Submersa",
    authorSlug: "davi-nogueira",
    year: 2018,
    price: "22.00",
    category: "Ficção",
    pages: 288,
    rating: "4.4",
    reviewCount: 73,
    synopsis: "Mergulhadores encontram, sob a baía, ruas inteiras que ninguém lembra de ter construído.",
    c1: "#1B3A57",
    c2: "#2A6A9E",
  },
  {
    slug: "receitas-de-quintal",
    title: "Receitas de Quintal",
    authorSlug: "tiago-albuquerque",
    year: 2025,
    price: "34.90",
    category: "Culinária",
    pages: 164,
    rating: "4.8",
    reviewCount: 39,
    synopsis: "Receitas de família feitas com o que o quintal oferece, contadas com as histórias de quem as cozinhava.",
    c1: "#6B3A1A",
    c2: "#B8692B",
  },
];
