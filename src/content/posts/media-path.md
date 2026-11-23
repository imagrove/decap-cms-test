---
title: 图片上传路径怎么走
date: 2026-11-22
draft: false
description: 记录 media_folder 与 public_folder 的关系，这是 Decap 最容易配错的地方。
tags:
  - decap
  - 配置
---

Decap 只有两个字段管图片：

- `media_folder`：图片在仓库里**物理落盘**的位置，这里是 `public/uploads`。
- `public_folder`：页面里引用图片的 **URL 前缀**，这里是 `/decap-cms-test/uploads`。

因为站点挂在 GitHub Pages 的项目页 `/decap-cms-test/` 下，`public_folder` 必须带上这段前缀，
否则后台预览和线上页面都会 404。将来换成独立域名（`decap.imagrove.com`），
把 `public_folder` 改回 `/uploads`，同时把 `astro.config.mjs` 的 `base` 删掉即可。
