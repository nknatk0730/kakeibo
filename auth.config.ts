// Better Auth CLI 用。Worker と同じ設定からスキーマを生成する。
import "dotenv/config";
import { createDb } from "./src/db/db";
import { createAuth } from "./src/worker/lib/auth";
import { readAuthEnv } from "./src/worker/lib/auth-env";
export const auth = createAuth(createDb(), readAuthEnv(process.env));
