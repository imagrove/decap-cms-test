# decap-cms-test

Decap CMS + Astro + GitHub 的闭环验证站：后台写稿 → 提交回仓库 → GitHub Actions 构建 → GitHub Pages 上线。

## 结构

```
public/admin/          Decap 后台入口（index.html + config.yml）
src/content/posts/     文章仓库，Decap 直接读写这里
src/content/products/  产品仓库，一个 md 文件就是一个产品
src/content.config.ts  两套 frontmatter 的 zod schema
src/lib/categories.ts  产品分类枚举的单一来源
oauth-worker/          GitHub OAuth 中转服务（Cloudflare Worker）
.github/workflows/     推 main 即构建上线
```

## 内容模型

产品是一个 Markdown 文件，字段写在 frontmatter 里：

| 字段 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | 必填 | 产品名称 |
| `model` | 可选 | 型号 |
| `category` | 必填 | `display` / `sensor` / `connectivity` / `power` / `accessory` |
| `summary` | 必填 | 一句话卖点，列表卡片与详情页顶部都用它 |
| `cover` / `gallery` | 可选 | 图片，落到 `public/uploads/` |
| `features` | 可选 | 对象数组，`title` + `detail` |
| `specs` | 可选 | 对象数组，`label` + `value`，详情页渲染成规格表 |
| `moq` / `lead_time` | 可选 | 起订量、交期 |
| `status` | 可选 | `active` / `eol`，停产产品仍可访问 |
| `featured` | 可选 | 是否进首页精选 |
| `order` | 可选 | 排序权重，数字小的在前 |

正文（`---` 之后的部分）渲染在详情页的「产品说明」。

**改字段要同步三处**，少一处就会在某个环节出问题：

1. `src/content.config.ts` 的 zod schema —— 决定构建能不能过
2. `public/admin/config.yml` —— 线上后台的控件
3. `public/admin/config.local.yml` —— 本地后台的控件

改分类枚举再加一处：`src/lib/categories.ts`（以及 schema 里的 `z.enum`）。

**schema 是故意的严格**：字段类型不合规会让构建失败，而不是渲染一个残缺页面。看到 Actions 红了先看是不是 md 的 frontmatter 写错了。

## 本地开发

本地有两套跑法，用途不同。

### 只看页面

```bash
npm install
npm run dev      # http://localhost:4321/decap-cms-test/
```

### 连后台一起跑（推荐，能真正写稿）

开两个终端：

```bash
npm run dev               # Astro，默认 4321
npm run cms               # decap-server，固定 8081，把后台改动写进本地 git
```

后台地址：http://localhost:4321/decap-cms-test/admin/index.html

- 本地访问必须带 `index.html`。Astro dev 不像 GitHub Pages 那样给目录做 index，`/admin/` 会 404。
- 本地打开后台会自动切到 `config.local.yml`（`local_backend: true`），点 Login 直接进，不需要 GitHub 登录。
- 保存文章或产品会在本地仓库产生一次 commit —— **这条不成立**：实测 `decap-server` 只写文件、不执行 git commit，改动以未提交状态出现。要验证"保存即提交"必须走 GitHub OAuth 模式。
- 上传的图片落在 `public/uploads/`。
- 改了 `content.config.ts` 的 schema 后要重启 dev server，否则 content 缓存会继续用旧 schema，表现为某个产品莫名不出现。


## 上线链路

1. 推送到 `imagrove/decap-cms-test` 的 `main`
2. Actions 构建 `dist/` 并发布到 Pages：https://imagrove.github.io/decap-cms-test/
3. 打开 https://imagrove.github.io/decap-cms-test/admin/ ，用 GitHub 账号登录

第 3 步目前还登不上：`config.yml` 里的 `base_url` 是占位地址，OAuth Worker 尚未部署。页面能正常打开并显示「Login with GitHub」，点下去会跳到不存在的域名，属预期状态。

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
