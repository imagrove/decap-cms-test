import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// 字段与 public/admin/config.yml 里两处 collection 的 fields 一一对应。
// schema 加严后，Decap 写出的 frontmatter 不合规会直接让构建失败，这是刻意的：
// 宁可挂 CI 也不要静默产出半成品页面。

// 产品目录：一个产品 = 一个 md 文件，图片与规格都随文件走，删文件即下架。
const products = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    model: z.string().optional(),
    category: z.enum(['display', 'sensor', 'connectivity', 'power', 'accessory']),
    summary: z.string(),
    cover: z.string().optional(),
    // Decap 的 list 不写 field 时按字符串数组写入
    gallery: z.array(z.string()).default([]),
    features: z
      .array(z.object({ title: z.string(), detail: z.string().optional() }))
      .default([]),
    specs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    moq: z.string().optional(),
    lead_time: z.string().optional(),
    status: z.enum(['active', 'eol']).default('active'),
    featured: z.boolean().default(false),
    order: z.number().default(100),
  }),
});

export const collections = { products };
