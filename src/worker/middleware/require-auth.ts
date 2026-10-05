import { createMiddleware } from "hono/factory";
import type { AppEnv } from "./database";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const session = await c.get("auth").api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "ログインが必要です。" }, 401);
  if (!session.user.emailVerified || session.user.banned) {
    return c.json({ error: "このアカウントでは利用できません。" }, 403);
  }
  // Cookie 認証を使う業務 API の書き込みも同一オリジンに限定する。
  if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
    const origin = c.req.header("Origin");
    const expected = new URL(c.get("auth").options.baseURL as string).origin;
    if (origin !== expected) return c.json({ error: "許可されていない送信元です。" }, 403);
  }
  c.set("session", session);
  await next();
});
