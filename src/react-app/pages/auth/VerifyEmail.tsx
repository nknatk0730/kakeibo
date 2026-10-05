import { Link, useLocation } from "react-router";
import AccountForm from "../../components/AccountForm";
import { emailField } from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function VerifyEmail() {
  const location = useLocation();
  return (
    <main className="authors-page">
      <h1>メールアドレスの確認</h1>
      <p>
        メールに記載されたリンクを開いてください。メールが届かない場合は再送できます。
      </p>
      <AccountForm
        fields={[emailField]}
        initialValues={{ email: location.state?.email ?? "" }}
        submitLabel="確認メールを再送"
        onSubmit={async (values) => {
          checkAuthResult(
            await authClient.sendVerificationEmail({
              email: values.email,
              callbackURL: "/login?verified=1",
            }),
          );
          return "確認が必要なアカウントの場合、メールを送信します。受信箱をご確認ください。";
        }}
      />
      <p>
        <Link to="/login">ログインへ</Link>
      </p>
    </main>
  );
}
