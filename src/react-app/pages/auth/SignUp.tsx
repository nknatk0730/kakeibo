import { Link, useNavigate } from "react-router";
import AccountForm from "../../components/AccountForm";
import { nameField, emailField, passwordField, confirmField } from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function SignUp() {
  const navigate = useNavigate();
  return (
    <main className="authors-page">
      <h1>新規登録</h1>
      <p>登録後、メール内のリンクでメールアドレスを確認してください。</p>
      <AccountForm
        fields={[nameField, emailField, passwordField, confirmField]}
        submitLabel="登録"
        onSubmit={async (values) => {
          checkAuthResult(
            await authClient.signUp.email({
              name: values.name,
              email: values.email,
              password: values.password,
              callbackURL: "/login?verified=1",
            }),
          );
          navigate("/verify-email", { state: { email: values.email } });
        }}
      />
      <p>
        <Link to="/login">ログインへ</Link>
      </p>
    </main>
  );
}
