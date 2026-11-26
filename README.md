# Imagrove 产品站

Astro 静态产品目录。产品写在仓库的 Markdown 里，市场与产品同事通过 Decap 后台编辑，推 `main` 自动构建上线。

- 线上：https://imagrove.github.io/decap-cms-test/
- 仓库：`github.com/imagrove/decap-cms-test`
- 工作日志：[`LOG.md`](./LOG.md) ｜ 并入主站的方案：[`待办.md`](./待办.md)

## 当前状态

| 项 | 状态 |
| :--- | :--- |
| 产品目录（列表 / 详情 / 分类） | ✅ 可用 |
| 品牌配色与字标（浅深双主题） | ✅ 已按规范接入 |
| 本地后台编辑（写文件 + 热更新） | ✅ 可用 |
| 线上后台登录（GitHub OAuth） | ❌ Worker 未部署，见「OAuth 中转服务」 |
| 产品图与参数 | ⚠️ 三个产品共用占位图，参数为示例值 |
| 文案语言 | ⚠️ 目前中文，面向海外客户需改英文 |
| 独立域名 | ❌ 暂挂在 GitHub Pages 项目路径下 |

## 目录结构

```
public/admin/            Decap 后台入口（index.html + 两份 config）
public/uploads/          产品图，后台上传落这里
src/content/products/    产品本体，一个 md 一个产品
src/content.config.ts    内容 collection 与 zod schema
src/lib/categories.ts    产品分类枚举的单一来源
src/lib/url.ts           站内链接前缀（BASE_URL 末尾无斜杠，必须走这里）
src/styles/tokens.css    品牌色 token，值取自品牌规范 §2
src/styles/global.css    组件样式，只消费 token 不写 hex
src/components/          BrandWordmark 等复用件
oauth-worker/            GitHub OAuth 中转（Cloudflare Worker，未部署）
.github/workflows/       推 main 构建并发布 Pages
```

## 内容模型

产品是一个 Markdown 文件，字段在 frontmatter 里：

| 字段 | 必填 | 说明 |
| :--- | :--- | :--- |
| `name` | 是 | 产品名称 |
| `model` | 否 | 型号 |
| `category` | 是 | `display` / `sensor` / `connectivity` / `power` / `accessory` |
| `summary` | 是 | 一句话卖点，列表卡片与详情页顶部共用 |
| `cover` / `gallery` | 否 | 图片路径，上传落在 `public/uploads/` |
| `features` | 否 | `title` + `detail` 的对象数组，详情页渲染成卡片 |
| `specs` | 否 | `label` + `value` 的对象数组，详情页渲染成规格表 |
| `moq` / `lead_time` | 否 | 起订量、交期，显示在询盘侧栏 |
| `status` | 否 | `active` / `eol`，停产产品仍可访问并带标记 |
| `featured` | 否 | 是否进首页精选 |
| `order` | 否 | 排序权重，数字小的在前 |

正文（`---` 之后）渲染在详情页的「产品说明」。

**改字段要同步三处**，少一处就会在某个环节出问题：

1. `src/content.config.ts` 的 zod schema —— 决定构建能不能过
2. `public/admin/config.yml` —— 线上后台的控件
3. `public/admin/config.local.yml` —— 本地后台的控件

改分类枚举再加一处 `src/lib/categories.ts`。

schema 是故意写严的：字段类型不合规会让构建失败，而不是渲染一个残缺页面。Actions 红了先查 md 的 frontmatter。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321/decap-cms-test/
```

要连后台一起跑（能真正写内容），开两个终端：

```bash
npm run dev      # Astro，默认 4321
npm run cms      # decap-server，固定 8081
```

后台地址：http://localhost:4321/decap-cms-test/admin/index.html

四个本地特有的坑：

- 地址必须带 `index.html`。Astro dev 不给目录做索引，`/admin/` 会 404。
- localhost 下自动切到 `config.local.yml`（`local_backend: true`），点 Login 直接进，不需要 GitHub 账号。
- `decap-server` **只写文件、不产生 git commit**。改动会以未提交状态出现，要验证"保存即提交"必须走 GitHub OAuth 模式。
- 改了 `content.config.ts` 要重启 dev server，否则 content 缓存沿用旧 schema，表现为某个产品莫名消失。

## 上线链路

1. 推到 `imagrove/decap-cms-test` 的 `main`
2. GitHub Actions 构建 `dist/` 并发布到 Pages
3. 约 1 分钟后生效

后台入口是 `/admin/`，**不出现在站点导航里**（对外站不暴露管理入口），管理员直接访问。

### OAuth 中转服务（待部署）

后台登录需要一个持有 `client_secret` 的服务端，代码已写好但还没部署。

```bash
cd oauth-worker
npx wrangler@4 deploy
npx wrangler@4 secret put GITHUB_CLIENT_ID
npx wrangler@4 secret put GITHUB_CLIENT_SECRET
```

前提是本机有带 Workers Scripts:Edit 权限的 Cloudflare token（现有的 `cloudflare.env` 是 zone 级 DNS/SSL 权限，不够用）。部署后把 Worker 地址回填到 `config.yml` 的 `base_url`，并在 GitHub 建一个 OAuth App，回调地址填 `<worker 地址>/callback`。

## 样式与品牌

- 颜色全部来自 `src/styles/tokens.css`，值取自《站点品牌色与主题Token规范》§2 的角色矩阵。**组件里不写品牌 hex**。
- 主题三处声明齐全：`:root`（浅色）、`:root[data-theme='dark']`（手动切换，暂未做切换器）、`prefers-color-scheme`（系统偏好兜底）。漏第三处会出现"系统是暗色、页面仍是浅色"。
- 字标用 `BrandWordmark.astro` 内联 SVG，取 `--brand-fg` 跟随主题反色，不涂蓝。源文件与其他站同源，sha 须一致。
- 站内链接一律走 `src/lib/url.ts` 的 `base`，不要直接读 `import.meta.env.BASE_URL` —— 它末尾不带斜杠，`${base}products/` 会拼成 `/decap-cms-testproducts/`。

## 换成独立域名时

四处一起改，缺一个就会出现资源 404 或后台登不上：

1. `astro.config.mjs`：`site` 换新域名，删掉 `base`
2. `public/admin/config.yml`：`site_url`、`display_url`、`logo_url`、`public_folder` 同步
3. GitHub 仓库 Settings > Pages 绑定自定义域名
4. `public/admin/config.yml` 的 `backend.repo` 若换仓库也要跟着改

## 待办

1. **文案改英文** —— 面向海外客户，现在全站中文。计划：内容字段写英文值，Decap 后台的字段标签保持中文，界面固定文案抽成一份 copy 表便于将来做双语。
2. **换真图与真参数** —— 现在三个产品共用 `public/uploads/product-placeholder.svg`，参数是示例值。
3. **部署 OAuth Worker** —— 见上文，需要一枚 Workers 权限的 Cloudflare token。
4. **定去处** —— 并入主站 `/products/` 还是独立子域，三种方式的对比与执行步骤见 [`待办.md`](./待办.md)。
5. **恢复动态板块** —— 路由与 posts collection 都还在，有真实文章时把导航和首页区块接回来。
