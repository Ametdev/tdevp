import { defineCollection, z } from 'astro:content';

const products = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.number().positive(),
    priceUnit: z.string().default('руб'),
    priceNote: z.string().optional(),
    category: z.enum([
      'Стеклянные конструкции',
      'Окна и защита',
      'Двери',
      'Подоконники',
      'Кондиционеры',
      'Жалюзи и шторы'
    ]),
    subcategory: z.string().optional(),
    image: z.string(),
    images: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    inStock: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

const reviews = defineCollection({
  type: 'content',
  schema: z.object({
    author: z.string(),
    date: z.date(),
    rating: z.number().min(1).max(5),
    avatar: z.string().optional(),
  }),
});

const gallery = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    category: z.string(),
    images: z.array(z.string()),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  products,
  reviews,
  gallery,
};
