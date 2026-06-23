export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  description: string;
  badge?: string;
};

export const categories = [
  "Todos",
  "Joyería",
  "Bolsos",
  "Accesorios",
  "Belleza",
] as const;

const discoSetImages = [
  "/products/set-collares-disco/1.avif",
  "/products/set-collares-disco/2.avif",
  "/products/set-collares-disco/3.avif",
  "/products/set-collares-disco/4.avif",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Set Collares Capas Disco Dorado",
    category: "Joyería",
    price: 12990,
    originalPrice: 18990,
    image: discoSetImages[0],
    images: discoSetImages,
    description:
      "Set de collares en capas con dijes disco en acabado dorado. Estilo minimal aesthetic, ideal para uso diario, salidas y regalo. Usalos juntos o por separado.",
    badge: "Nuevo",
  },
  {
    id: "2",
    name: "Mini Bolso Crossbody Retro",
    category: "Bolsos",
    price: 18990,
    originalPrice: 27990,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac1423a8f6d?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac1423a8f6d?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1566150905458-677bf7b3397b?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Mini bolso crossbody estilo retro con correa ajustable. Compacto y versátil para salidas.",
  },
  {
    id: "3",
    name: "Pack Scrunchies Satín x12",
    category: "Accesorios",
    price: 8990,
    image:
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Pack de 12 scrunchies en satín suave. Colores pastel mezclados, ideal para regalo.",
  },
  {
    id: "4",
    name: "Lentes Sol Cat Eye Rosa",
    category: "Accesorios",
    price: 14990,
    originalPrice: 21990,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Lentes de sol cat eye con montura rosa translúcida. Protección UV400 y estilo Y2K.",
    badge: "Trend",
  },
  {
    id: "5",
    name: "Organizador Maquillaje Acrílico",
    category: "Belleza",
    price: 16990,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526045478518-909599cb5136?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Organizador acrílico transparente con cajones. Mantiene tu setup de maquillaje ordenado.",
  },
  {
    id: "6",
    name: "Cinturón Cadena Dorada",
    category: "Accesorios",
    price: 11990,
    image:
      "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583fd?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1594633312681-425a7b956cc2?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Cinturón cadena dorado ajustable. Ideal sobre blazers, vestidos o denim de tiro alto.",
  },
  {
    id: "7",
    name: "Set Anillos Apilables x6",
    category: "Joyería",
    price: 9990,
    originalPrice: 14990,
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1611652022418-f697a3cc7af7?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Set de 6 anillos apilables en tonos dorado y plateado. Tallas mixtas incluidas.",
    badge: "Oferta",
  },
  {
    id: "8",
    name: "Bandolera Mini Cuero Vegano",
    category: "Bolsos",
    price: 19990,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac1423a8f6d?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Bandolera mini en cuero vegano con herrajes dorados. Espacio para celular y esenciales.",
  },
  {
    id: "9",
    name: "Collar Perlas y Concha",
    category: "Joyería",
    price: 13990,
    image:
      "https://images.unsplash.com/photo-1611591434241-42e4289b172b?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1611591434241-42e4289b172b?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Collar con perlas naturales y dije concha. Vibes costeras, perfecto para Viña del Mar.",
    badge: "Costa",
  },
  {
    id: "10",
    name: "Espejo LED Portátil",
    category: "Belleza",
    price: 15990,
    originalPrice: 22990,
    image:
      "https://images.unsplash.com/photo-1526045478518-909599cb5136?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1526045478518-909599cb5136?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Espejo de maquillaje con luz LED regulable. Recargable por USB, compacto para bolso.",
  },
  {
    id: "11",
    name: "Pulseras Friendship Set x5",
    category: "Joyería",
    price: 7990,
    image:
      "https://images.unsplash.com/photo-1611652022418-f697a3cc7af7?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1611652022418-f697a3cc7af7?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Set de 5 pulseras tipo friendship en colores pastel. Regalo perfecto para amigas.",
  },
  {
    id: "12",
    name: "Riñonera Aesthetic Nude",
    category: "Bolsos",
    price: 17990,
    image:
      "https://images.unsplash.com/photo-1566150905458-677bf7b3397b?w=800&h=1000&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1566150905458-677bf7b3397b?w=800&h=1000&fit=crop&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop&q=80",
    ],
    description:
      "Riñonera color nude con correa gruesa. Estilo streetwear aesthetic, unisex.",
    badge: "Nuevo",
  },
];

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}
