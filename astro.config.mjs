// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages 项目页地址：https://imagrove.github.io/decap-cms-test/
// 绑定自定义域名后把 base 改成 '/'，并同步 public/admin/config.yml 的 public_folder
export default defineConfig({
  site: 'https://imagrove.github.io',
  base: '/decap-cms-test',
  trailingSlash: 'ignore',
});
