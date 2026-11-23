import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 字段与 public/admin/config.yml 里 posts collection 的 fields 一一对应。
// schema 加严后，Decap 写出的 frontmatter 不合规会直接让构建失败，这是刻意的：
// 宁可挂 CI 也不要静默产出半成品页面。
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
  }),
});

export const collections = { posts };
