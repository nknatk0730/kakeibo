import { z } from "zod";

const authEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_FROM: z.string().min(1),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});
export type AuthEnv = z.infer<typeof authEnvSchema>;
export function readAuthEnv(source: unknown): AuthEnv {
  const result = authEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`認証設定を確認してください: ${result.error.issues.map(i => i.path.join(".")).join(", ")}`);
  }
  return result.data;
}
