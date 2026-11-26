# LOG · decap-cms-test

> **定位**：Imagrove 产品站的工作日志——记录**做了什么、踩了什么坑、还差什么**。要跑起来看 [`README.md`](./README.md)；要看它在站点矩阵里的位置看 [`../独立站技术架构.md`](../独立站技术架构.md) §4。
> **边界**：只记"这一次"做了什么、根因、怎么验证、留了什么尾巴。同一类问题出现第二次时提炼成独立规范，此处只留指针。
> **相关**：[`README.md`](./README.md)（运行方式与字段说明）· [`../独立站技术架构.md`](../独立站技术架构.md) §4（单站脚手架基线）· 跨站基建日志见 [`../LOG.md`](../LOG.md)
> **当前状态（2026-11-27）**：站点已按对外产品站重写，产品目录可用、导航只剩「产品」、管理入口走 `/admin/`。线上后台登录仍不可用——缺 Worker 部署与 GitHub OAuth App。内容为中文、图为占位、参数为示例值，三项均在 README「待办」里。

## 2026-11-27 · 并入主站 imagrove.com 的 /products/

### 背景

按 [`待办.md`](./待办.md) 的方案 A 执行：内容与页面并进主站仓库，路由挂 `/products/`，不再单独部署。主站是英文站（`lang="en"`），因此顺带解决了语言问题——产品内容直接写成英文。

### 变更（主站 `imagrove.com`）

- **内容**：新建 `src/content/products/`（三个英文产品 md）、`src/content.config.ts`、`src/lib/products.ts`（分类用英文标签）
- **页面**：`src/pages/products/index.astro`（分类分组卡片）与 `[slug].astro`（两栏：正文 + sticky 询价卡）
- **样式**：不复用原型的 `tokens.css` 与组件 CSS，改用主站 Tailwind 角色类名重写，只保留深色——主站在规范 §6.3 登记为仅深色，产品页跟随主站，否则同域下首页深、产品页白
- **正文排版**：`global.css` 追加 `.product-prose` 作用域，只作用于详情页 Markdown，不影响首页 / ODM / cases
- **导航**：`Nav.astro` 加 `Products`，`current` 类型扩展 `'products'`
- **后台**：`public/admin/` 搬入，`config.yml` 改 `repo` → `imagrove/imagrove.com`、`site_url` → `https://imagrove.com`、`public_folder` → `/uploads`，删掉主站不存在的 posts 集合；`base_url` 保持 Worker 地址不变
- **图片**：三个型号各生成一张技术图纸风格的深色 SVG（`public/uploads/product-tp-l1.svg` 等），替代"产品图待补"占位

### 验证

- 本地 `npm run build`：8 页（原 4 页 + 产品列表 + 3 个详情）
- Playwright 实际点击：首页导航出现 PRODUCTS → 列表 3 张卡 → 详情页；`/odm/` 标题与版式完好，现有页面未受影响
- 线上 `imagrove.com`：`/`、`/products/`、`/products/telepilot-lora/`、`/products/media-control-panel/`、`/admin/`、`/odm/` 全部 200，title 正确

### 尾巴

- **产品参数仍是示例值**，对外报价或投标前必须由产品线逐项确认
- **OAuth Worker 仍未部署**：主站 `/admin/` 能打开，但 `config.yml` 的 `base_url` 还是占位地址，点登录会失败
- **Worker 位置待迁**：`oauth-worker/` 留在本仓库，而本仓库已归档。它是两站共用的基础设施，应迁到主站仓库或独立基础设施仓库
- 本仓库的 GitHub Pages 仍在线，暂未关闭；确认主站稳定后可停

## 2026-11-27 · 按对外站点重写：去掉所有实现细节

### 背景

站点要对客户可见。此前页面上到处是"产品信息写在仓库的 Markdown 里""每个产品是 `src/content/products/` 下的一个 Markdown 文件""本页为内容模型原型"——这类话对访客没有意义，还把内部实现摊在明面上。

### 变更

- **首页 hero 换成业务主张**：「硬件定制，从方案到量产交付」，副文案说明覆盖方案定义、打样验证与批量生产，支持外观/接口/固件定制。第二个按钮从「打开内容后台」改为「提交询盘」，指向主站 `/odm/`。
- **产品目录页**删掉内部路径那句，改为「共 N 个产品，按品类浏览」。
- **页脚**删掉构建链路的解释，改为品牌一句话 + 产品链接 + 合作入口，底部 `© 2026 Imagrove`。
- **全站移除「原型」字样**：页面 title、eyebrow、页脚、说明条。
- **导航删掉「后台」入口**：对外站不暴露管理入口，管理员直接访问 `/admin/`，地址写进 README。
- **删除两篇示例文章**（整篇在讲 Decap 字段与 `media_folder`），「动态」板块从导航与首页撤下；路由与 posts collection 保留，有真实内容时接回。
- 源码注释里的 Decap 说明保留 —— 不渲染，是给维护者看的。

### 验证

- `npm run build`：6 页（比之前少两篇文章页）。
- 新增页面可见文本扫描：抽掉 `script`/`style` 后按标签去壳，检查 `Markdown` / `Decap` / `仓库` / `原型` / `CMS` 五个词。六个页面全部 clean，线上三个页面复扫同样 clean。这个检查以后改文案可以重复跑。

### 尾巴

- 全站中文，面向海外客户需改英文，见 README 待办第 1 条。
- `/posts/` 路由仍在，直接访问显示「暂无发布内容」。

## 2026-11-27 · 修全站导航 404（BASE_URL 末尾不带斜杠）

### 现象

首页点导航「产品」「后台」「动态」全部 404，但直接在地址栏敲这三个 URL 却是 200。

### 根因

Astro 的 `import.meta.env.BASE_URL` 值是 `/decap-cms-test`，**末尾不带斜杠**。页面里写成 `${base}products/`，拼出来是 `/decap-cms-testproducts/` —— 少了一个分隔符。线上 HTML 里能直接看到 `href="/decap-cms-testproducts/"`。

### 为什么没早发现

之前每次验证都是 curl 或 Playwright 直接 `goto` 目标 URL，页面里的链接一次都没被点过。**链接拼接错误只在"点"的时候暴露**——这是验证方式的问题，不是代码复杂到看不出来。

### 修复

- 新增 `src/lib/url.ts`，导出补过尾斜杠的 `base`，六个页面改为 `import { base }`，不再各自读 `import.meta.env`。绑自定义域名后 `BASE_URL` 为 `/`，结果仍是 `/`，行为不变。
- 顺带修 dev 下的后台入口：Astro dev 不给 `public/` 目录做索引，`/admin/` 会 404，`Base.astro` 里按 `import.meta.env.DEV` 切到 `admin/index.html`；生产构建仍走目录索引。

### 验证

- Playwright 真实点击四项：产品导航（3 张卡片）、产品卡进详情、后台（落到 Login）、动态，全部通过，无 pageerror。
- `dist/` 内 grep 无 `/decap-cms-test[a-z]` 残留。
- 线上首页 href 全部形如 `/decap-cms-test/products/`，三个入口均 200。

### 教训

站内链接的改动必须**点一遍**才算验证通过。curl 只能证明"目标页存在"，证明不了"入口链接正确"。

## 2026-11-26 · 样式按品牌 token 重做，接入字标与双主题

### 背景

之前的样式是临时手写的（白底、系统蓝链接），跟《站点品牌视觉规范》没有关系，看不像 Imagrove 的站。这次按规范重做，而不是套第三方模板。

### 为什么不上现成模板

看过 AstroWind、Astroship、ScrewFast 一类 Astro 营销模板：都用 Tailwind 且自带色板与字标体系。套上去要同时改规范 §2 的十二个色角色和 §4 的字标规则，改造成本高于按 token 重写；而这个原型最终要长到真实产品站上，视觉必须与矩阵同源。**结论：借版式思路（卡片栅格、sticky 侧栏、分段留白），不借视觉。**

### 变更

- **新增 `src/styles/tokens.css`**：按规范 §2 的十二个角色落档，浅色（`:root`）、暗色（`:root[data-theme='dark']`）、系统偏好兜底（`prefers-color-scheme`）三处声明齐全（§3.3）。§2 未定义边框角色，沿用 drone 手写页的 `--border` 取值，未另造色。
- **组件不再写 hex**（§3.5）：`global.css` 全部消费角色变量，亮蓝只用于大标题强调，链接走深蓝档（§2 判据：`#3b82f6` 在浅底只有 3.49）。
- **接入字标**：从 drone 复制 `imagrove-wordmark.svg`（sha `16e83d2f…62db26`，与权威源一致），新增 `BrandWordmark.astro`，导航 24px、页脚 22px。字标用 `currentColor` 跟随主题反色，不涂蓝（§4.1）。
- **版式**：1120 容器、sticky 顶栏、首页 hero（eyebrow + 双色标题 + 双按钮）、产品卡 16:10 图 + hover 抬升、详情页两栏（左内容右 sticky 询盘卡含起订量/交期/状态）、规格表改网格化边框、页脚三列。
- **占位图改半透明描边**（`public/uploads/product-placeholder.svg`）：原来深色实底在浅色页面压得太重，现在浅深主题下都融得进去。
- **规范同步**：§4 字标资产表的「现存副本」登记 `decap-cms-test`；§6 各站现状新增第 7 条。

### 验证

- `npm run build`：8 页通过，无类型错误。
- Playwright 截浅色首页/产品目录/产品详情、暗色产品详情、390px 移动端共 5 张，均无 console 错误、无 pageerror。
- 暗色下字标自动转纯白，是因为取 `--brand-fg` 而非固定色，不需要切换逻辑。

### 尾巴

- 未做主题切换器 UI，`data-theme` 那处声明先占位，将来加切换器不用改样式。
- 产品仍是占位图，真图接入后卡片的 16:10 裁切效果要复核一次。
- 规范 §7 要求"每轮配色改动后在浏览器取计算值复核对比度"，本次只做了字标与链接的可视核对，未逐角色取 `getComputedStyle` 值——留到接入真实产品站前补。

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
