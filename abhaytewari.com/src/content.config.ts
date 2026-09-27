import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    readingTime: z.string().optional(),
  }),
});

const stories = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/stories' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    kind: z.enum(['story', 'essay', 'poem']).default('story'),
    draft: z.boolean().default(false),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    level: z.enum(['Foundation', 'Intermediate', 'Advanced']),
    duration: z.string(),
    status: z.enum(['open', 'coming-soon', 'closed']).default('coming-soon'),
    audience: z.string(),
    modules: z.array(z.object({ title: z.string(), lessons: z.array(z.string()) })),
    enrolUrl: z.string().optional(),
    price: z.string().optional(),
  }),
});

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    course: z.string(),
    order: z.number(),
    description: z.string().optional(),
  }),
});

export const collections = { blog, stories, courses, lessons };
