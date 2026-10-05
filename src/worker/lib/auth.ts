import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import type { createDb } from "../../db/db";
import * as schema from "../../db/schemas/auth";
import type { AuthEnv } from "./auth-env";
import { sendMail } from "./mail";

export function createAuth(db: ReturnType<typeof createDb>, env: AuthEnv, waitUntil?: (task: Promise<unknown>) => void) {
  const deliver = async (to: string, subject: string, url: string) => {
    const task = sendMail(env, { to, subject, text: `${subject}\n\n次のリンクを開いてください。\n${url}\n\n心当たりがない場合は、このメールを無視してください。` });
    if (waitUntil) {
      waitUntil(task.catch(() => { console.error("認証メールの送信に失敗しました。SMTP の設定・接続を確認してください。"); }));
    } else {
      await task;
    }
  };
  return betterAuth({
    appName: "Kakeibo",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
    database: drizzleAdapter(db, { provider: "pg", schema }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      autoSignIn: false,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, url }) => deliver(user.email, "パスワードの再設定", url),
      customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
        ...coreFields, ...additionalFields, role: "user", banned: false,
        banReason: null, banExpires: null, id,
      }),
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: false,
      sendVerificationEmail: ({ user, url }) => deliver(user.email, "メールアドレスの確認", url),
    },
    session: { cookieCache: { enabled: false } },
    rateLimit: { enabled: true, storage: "database" },
    advanced: { ipAddress: { ipAddressHeaders: ["cf-connecting-ip"] } },
    plugins: [admin()],
  });
}
export type Auth = ReturnType<typeof createAuth>;
