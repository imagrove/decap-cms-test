// 站内路径前缀。Astro 的 BASE_URL 末尾不带斜杠（'/decap-cms-test'），
// 直接 `${base}products/` 会拼成 '/decap-cms-testproducts/' —— 全站链接 404。
// 这里统一补成带尾斜杠的形态，页面里只 import 这个 base，不直接读 import.meta.env。
// 绑自定义域名后 BASE_URL 为 '/'，此处结果为 '/'，行为不变。
export const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
