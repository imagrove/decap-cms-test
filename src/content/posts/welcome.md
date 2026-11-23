---
title: 欢迎来到 Decap CMS 测试站
date: 2026-11-20
draft: false
description: 验证 Decap 写入的 frontmatter 能被 Astro content collection 正确解析。
tags:
  - decap
  - 说明
---

这是仓库里预置的第一篇文章，用来确认三件事：

1. `src/content/posts/` 下的 markdown 能被 Astro content collection 读到；
2. frontmatter 字段与 `src/content.config.ts` 的 zod schema 对齐；
3. 站点构建产物里文章页、列表页都正常。

接下来打开 `/admin/`，用 GitHub 登录后新建一篇，看它是否会在仓库里生成一次 commit。
