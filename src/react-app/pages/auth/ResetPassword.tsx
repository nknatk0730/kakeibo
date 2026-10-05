import { Link, useSearchParams } from "react-router";
import AccountForm from "../../components/AccountForm";
import { passwordField, confirmField } from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token");
  return (
    <main className="authors-page">
      <h1>パスワードの再設定</h1>
      {!token || params.has("error") ? (
        <p role="alert">
          リンクが無効、または期限切れです。
          <Link to="/forgot-password">メールを再送する</Link>
        </p>
      ) : (
        <AccountForm
          fields={[passwordField, confirmField]}
          submitLabel="パスワードを再設定"
          onSubmit={async (values) => {
            checkAuthResult(
              await authClient.resetPassword({
                token,
                newPassword: values.password,
              }),
            );
            return "パスワードを再設定しました。新しいパスワードでログインしてください。";
          }}
        />
      )}
      <p>
        <Link to="/login">ログインへ</Link>
      </p>
    </main>
  );
}
