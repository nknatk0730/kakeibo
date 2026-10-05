import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({ plugins: [adminClient()] });

export function checkAuthResult<T>(result: {
  data: T;
  error: { code?: string; message?: string; status?: number } | null;
}): NonNullable<T> {
  if (result.error) {
    const messages: Record<string, string> = {
      INVALID_EMAIL_OR_PASSWORD:
        "メールアドレスまたはパスワードが正しくありません。",
      EMAIL_NOT_VERIFIED:
        "メールアドレスを確認してください。確認メールを再送できます。",
      USER_BANNED: "このアカウントは利用停止中です。",
      INVALID_PASSWORD: "現在のパスワードが正しくありません。",
      INVALID_TOKEN:
        "リンクが無効、または期限切れです。メールを再送してください。",
      TOKEN_EXPIRED: "リンクの期限が切れています。メールを再送してください。",
    };
    throw new Error(
      result.error.status === 429
        ? "時間をおいて再度お試しください。"
        : (messages[result.error.code ?? ""] ??
            "処理に失敗しました。入力内容と接続を確認してください。"),
    );
  }
  return result.data as NonNullable<T>;
}
