import { Link } from "react-router";
import AccountForm from "../../components/AccountForm";
import { emailField } from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function ForgotPassword() {
  return (
    <main className="authors-page">
      <h1>パスワード再設定メール</h1>
      <AccountForm
        fields={[emailField]}
        submitLabel="再設定メールを送信"
        onSubmit={async (values) => {
          checkAuthResult(
            await authClient.requestPasswordReset({
              email: values.email,
              redirectTo: "/reset-password",
            }),
          );
          return "登録されているアドレスの場合、再設定メールを送信します。受信箱をご確認ください。";
        }}
      />
      <p>
        <Link to="/login">ログインへ</Link>
      </p>
    </main>
  );
}
