import { createMiddleware } from "hono/factory";
import { createDb } from "../../db/db";
import { createAuth, type Auth } from "../lib/auth";
import { readAuthEnv } from "../lib/auth-env";

export type AppEnv = {
  Bindings: Env;
  Variables: {
    db: ReturnType<typeof createDb>;
    auth: Auth;
    session: Auth["$Infer"]["Session"];
  };
};
export const database = createMiddleware<AppEnv>(async (c, next) => {
  const db = createDb();
  try {
    c.set("db", db);
    c.set("auth", createAuth(db, readAuthEnv(c.env), task => c.executionCtx.waitUntil(task)));
    await next();
  } finally {
    await db.$client.end();
  }
});
