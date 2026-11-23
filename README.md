# decap-cms-test

Decap CMS + Astro + GitHub 的闭环验证站：后台写稿 → 提交回仓库 → GitHub Actions 构建 → GitHub Pages 上线。

## 结构

```
public/admin/          Decap 后台入口（index.html + config.yml）
src/content/posts/     文章仓库，Decap 直接读写这里
src/content.config.ts  文章 frontmatter 的 zod schema
oauth-worker/          GitHub OAuth 中转服务（Cloudflare Worker）
.github/workflows/     推 main 即构建上线
```

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/decap-cms-test/
```

`/admin/` 在本地能打开，但登录要连 GitHub，所以本地只适合看界面。

## 上线链路

1. 推送到 `imagrove/decap-cms-test` 的 `main`
2. Actions 构建 `dist/` 并发布到 Pages：https://imagrove.github.io/decap-cms-test/
3. 打开 https://imagrove.github.io/decap-cms-test/admin/ ，用 GitHub 账号登录

## OAuth 中转服务

后台登录需要一个持有 `client_secret` 的中转服务，代码在 `oauth-worker/`。

```bash
cd oauth-worker
npx wrangler@4 deploy
npx wrangler@4 secret put GITHUB_CLIENT_ID
npx wrangler@4 secret put GITHUB_CLIENT_SECRET
```

对应的 GitHub OAuth App 回调地址填 `<worker 地址>/callback`。

## 换成独立域名时

三处一起改，缺一个就会出现资源 404 或后台登不上：

1. `astro.config.mjs`：`site` 换成新域名，删掉 `base`
2. `public/admin/config.yml`：`site_url`、`display_url`、`logo_url`、`public_folder` 同步
3. GitHub 仓库 Settings > Pages 绑定自定义域名
