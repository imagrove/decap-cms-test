/**
 * Decap CMS 的 GitHub OAuth 中转服务（Cloudflare Worker）。
 *
 * 为什么需要它：Decap 在浏览器里跑，拿不到 GitHub OAuth 的 client_secret。
 * 于是登录走 popup：站点打开 <base_url>/auth → 本 Worker 跳 GitHub 授权页 →
 * GitHub 带 code 回到 <base_url>/callback → 本 Worker 用 code + secret 换 access_token →
 * 把 token 通过 postMessage 交给原站点窗口。
 *
 * 需要的环境变量（wrangler secret put 写入，不进仓库）：
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 */

const SCOPE = 'repo,user';

function html(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

// 把 token 交给打开本窗口的 Decap 页面。Decap 会先发一条 authorizing 消息，
// 收到后我们用 e.origin 原路回发，避免把 token 广播给任意 origin。
function callbackPage(payload) {
  return html(`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><title>登录中…</title></head>
<body style="font-family:-apple-system,sans-serif;padding:2rem">
<p>正在完成 GitHub 登录，稍后此窗口会自动关闭。</p>
<script>
(function () {
  var message = ${JSON.stringify(payload)};
  function receiveMessage(e) {
    window.opener.postMessage(message, e.origin);
    window.removeEventListener('message', receiveMessage, false);
    setTimeout(function () { window.close(); }, 800);
  }
  if (!window.opener) {
    document.body.textContent = '未找到父窗口，请从站点后台重新发起登录。';
    return;
  }
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body></html>`);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return html('<p>Decap OAuth provider for imagrove/decap-cms-test is running.</p>');
    }

    if (url.pathname === '/auth') {
      const state = crypto.randomUUID();
      const authorize = new URL('https://github.com/login/oauth/authorize');
      authorize.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authorize.searchParams.set('redirect_uri', `${url.origin}/callback`);
      authorize.searchParams.set('scope', SCOPE);
      authorize.searchParams.set('state', state);

      return new Response(null, {
        status: 302,
        headers: {
          Location: authorize.toString(),
          // state 存 cookie 端到端校验，防 CSRF。GitHub 回调是顶层导航，Lax 即可。
          'Set-Cookie': `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
        },
      });
    }

    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      const cookie = request.headers.get('Cookie') || '';
      const savedState = cookie
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith('decap_oauth_state='))
        ?.slice('decap_oauth_state='.length);

      if (!code || !state || !savedState || state !== savedState) {
        return callbackPage('authorization:github:error:' + JSON.stringify({ message: 'state 校验失败，请重新登录' }));
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const data = await tokenResponse.json();
      if (!data.access_token) {
        return callbackPage(
          'authorization:github:error:' + JSON.stringify({ message: data.error_description || '换取 access_token 失败' })
        );
      }

      return callbackPage(
        'authorization:github:success:' + JSON.stringify({ token: data.access_token, provider: 'github', scope: data.scope })
      );
    }

    return html('<p>Not found</p>', 404);
  },
};
