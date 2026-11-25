# LOG · decap-cms-test

> **定位**：内容生产原型的工作日志——记录这个原型**验证了什么、踩了什么坑、还差什么**。要看怎么跑起来看 [`README.md`](./README.md)；要看向上怎么嵌进站点矩阵看 [`../独立站技术架构.md`](../独立站技术架构.md) §4。
> **边界**：只记"这一次"做了什么、根因、怎么验证、留了什么尾巴。同一类问题出现第二次时提炼成独立规范，此处只留指针。
> **相关**：[`README.md`](./README.md)（运行方式与字段说明）· [`../独立站技术架构.md`](../独立站技术架构.md) §4（单站脚手架基线）· 跨站基建日志见 [`../LOG.md`](../LOG.md)
> **当前状态（2026-11-26）**：本地编辑闭环可用（后台改完，页面立即变）；线上站点可正常浏览；**线上后台登录尚不可用**——缺 Worker 部署与 GitHub OAuth App。产品字段与页面形态已定型，参数是示例值。

## 2026-11-26 · 原型从"能写文章"扩成"能维护产品目录"

### 背景

同事接手后真正要改的是产品信息，不是文章。所以内容模型按产品页的实际需要重做，没有沿用示例的 posts。

### 变更

- **新增 products collection**：`src/content/products/`，一个 md 文件就是一个产品，加文件即上线、删文件即下架。
- **字段**：`name` / `model` / `category` / `summary` / `cover` / `gallery` / `features`（标题+说明成对）/ `specs`（项目+内容成对）/ `moq` / `lead_time` / `status`（在售·停产）/ `featured`（首页精选）/ `order`（排序权重）。
- **五个分类**：显示与交互、传感与采集、通信与网关、电源与控制、配件与模块。枚举的单一来源是 `src/lib/categories.ts`。
- **页面**：首页改为产品优先（精选 3 个 + 最近动态 3 条）；`/products/` 按分类分组并带锚点导航；`/products/[id]/` 详情页含规格表、特点卡片、图集、起订量与交期、询盘位、停产标记。
- **后台**：两份 config 都加了 products collection，配了按分类的 view_groups、可排序字段和字段 hint。
- **三个示例产品**：TelePilot 远传遥控终端、SmartEnergy 电能监测网关、MediaControl 多媒体控制面板。参数与图片均为示例，页面底部有说明条。

### 实测发现（三个坑）

1. **list 字段的写入形态容易猜错。** 先按"图片列表是对象数组"配成 `field: { name: image, widget: image }`，结果后台一打开产品就白屏，报 `e.replace is not a function`。去掉 `field`、让 list 按字符串数组写入后正常，schema 也同步改回 `z.array(z.string())`。判据：**Decap 的 list 不写 `field` 时为字符串数组**。
2. **本地模式只写文件、不产生 commit。** 在后台改了一句卖点并点发布，md 确实被改写、页面热更新，但 `git log` 没有新记录，文件以未提交状态存在。所以"保存即提交"这条只能在 GitHub OAuth 模式下验证，本地能验的只是"写文件 + 渲染"。
3. **改 schema 后必须重启 dev server。** 否则 content 缓存沿用旧 schema，表现为某个产品从列表里消失，而 `npm run build` 完全正常——很容易被误判成数据写错。

### 验证

- `npm run build`：8 页全部生成（首页、产品目录、3 个产品详情、文章列表、2 篇文章）。
- 浏览器实测（Playwright 驱动本地 Chrome）：列表页 3 个产品按分类分组正确；详情页规格表、特点、图集正常；后台能打开 TelePilot，全部字段与右侧预览都在。
- 线上 https://imagrove.github.io/decap-cms-test/ ：`/`、`/products/`、`/products/telepilot-lora/`、`/admin/` 均返回 200。

### 尾巴

- 产品参数与图片是示例，对外发布前须产品线确认；`public/uploads/product-placeholder.svg` 是占位图，不是实物。
- **改字段要同步三处**：`src/content.config.ts` 的 schema、`public/admin/config.yml`、`public/admin/config.local.yml`。**改分类再加一处**：`src/lib/categories.ts`。
- OAuth 与托管两件事原样挂着，见下一条。

## 2026-11-24 · 建站：Decap + Astro + GitHub Pages 闭环骨架

### 背景

验证"同事改内容 → 提交 → 自动构建上线"这条链路在现有技术栈里跑不跑得通、代价多大。这一步先不问网站长什么样，只问链路通不通。

### 变更

- 仓库 `imagrove/decap-cms-test`（公开），Astro 7 + GitHub Actions → GitHub Pages，线上地址是项目页 `/decap-cms-test/`。
- 后台入口 `public/admin/index.html`：CDN 引 Decap `3.18.0`（锁精确版本、不用 `^`），**必须在 `<body>` 内加载**。
- 两份后台配置：`config.yml`（GitHub OAuth，线上用）与 `config.local.yml`（`local_backend: true`，localhost 自动切过去）。
- `oauth-worker/`：Cloudflare Worker 实现 `/auth` 与 `/callback`，带 state 防 CSRF、用 `e.origin` 回发 token。**代码完成但未部署。**
- 部署链：push `main` → Actions 构建 `dist/` → 发布 Pages。action 已升到 checkout v7 / setup-node v7 / upload-pages-artifact v5 / deploy-pages v5。

### 实测发现

1. **Decap 放 `<head>` 会崩**：抛 `appendChild of null`，页面只剩一个 Decap logo 和点不动的 Login。必须在 `<body>` 里加载。
2. **自托管 Decap 不划算**：`dist/` 有 385 个文件、共约 64MB，且主文件会从同源相对路径动态加载 code-split chunk。只镜像主文件会让部分功能 404，全量镜像又不适合进 Git 仓库。最终保留 CDN + 锁版本，并放弃 SRI（SRI 只能覆盖主文件，反而给出安全假象）。
3. **`cms-config-url` 这个 link 必须带 `type="text/yaml"`**，少了这个属性会被 Decap 忽略，本地会误用线上配置。

### 验证

- 本地：点 Login 直接进内容列表（证明 `local_backend` 生效），文章可读。
- 线上：`/admin/` 正确显示「Login with GitHub」，说明按 hostname 切换配置的判断有效，没有误用本地配置。
- 首次部署遇到 `deploy-pages` 返回 502，日志提示 GitHub Pages 服务端故障，重跑一次通过——不是配置问题。

### 尾巴

- **OAuth 未闭环**：现有 Cloudflare 凭证是 zone 级（DNS/SSL），没有 Workers Scripts 编辑权限，Worker 没能部署；`config.yml` 里的 `base_url` 仍是占位地址。补救步骤见 [`README.md`](./README.md)「OAuth 中转服务」。
- **托管偏离文档**：[`../独立站技术架构.md`](../独立站技术架构.md) §2.1 的判据是"静态内容默认 Vercel"，原型放在 Pages 是权宜（本机没有 Vercel 凭证，token 只在 Actions secrets 里）。接真实产品站时一起迁到 Vercel，`public/admin/` 与 Worker 可原样复制，偏离只在托管层。
