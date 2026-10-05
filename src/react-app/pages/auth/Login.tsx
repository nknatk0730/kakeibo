import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import AccountForm from "../../components/AccountForm";
import { emailField, passwordField } from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const client = useQueryClient();
  const { refetch } = authClient.useSession();
  return (
    <main className="authors-page">
      <h1>ログイン</h1>
      {params.has("error") ? (
        <p role="alert">
          確認リンクが無効、または期限切れです。確認メールを再送してください。
        </p>
      ) : (
        params.has("verified") && (
          <p role="status">メール確認が完了しました。ログインしてください。</p>
        )
      )}
      <AccountForm
        fields={[
          emailField,
          { ...passwordField, autoComplete: "current-password" },
        ]}
        submitLabel="ログイン"
        onSubmit={async (values) => {
          checkAuthResult(
            await authClient.signIn.email({
              email: values.email,
              password: values.password,
            }),
          );
          await client.cancelQueries();
          client.clear();
          // ログイン後のセッションを反映してから保護された画面へ移動する。
          await refetch();
          const from = location.state?.from;
          navigate(
            typeof from === "string" &&
              /^\/(authors|settings|admin)(\/|$)/.test(from)
              ? from
              : "/authors",
            { replace: true },
          );
        }}
      />
      <p>
        <Link to="/signup">新規登録</Link> ·{" "}
        <Link to="/verify-email">確認メールの再送</Link> ·{" "}
        <Link to="/forgot-password">パスワードを忘れた方</Link>
      </p>
    </main>
  );
}
