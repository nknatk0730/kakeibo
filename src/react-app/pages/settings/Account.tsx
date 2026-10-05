import { z } from "zod";
import AccountForm from "../../components/AccountForm";
import {
  nameField,
  passwordField,
  confirmField,
} from "../../lib/account-fields";
import { authClient, checkAuthResult } from "../../lib/auth-client";
export default function Account() {
  const { data, refetch } = authClient.useSession();
  if (!data) return null;
  return (
    <main className="authors-page">
      <h1>アカウント設定</h1>
      <p>{data.user.email}</p>
      <h2>プロフィール</h2>
      <AccountForm
        key={data.user.id}
        fields={[nameField]}
        initialValues={{ name: data.user.name }}
        submitLabel="名前を保存"
        onSubmit={async (values) => {
          checkAuthResult(await authClient.updateUser({ name: values.name }));
          await refetch();
          return "名前を保存しました。";
        }}
      />
      <h2>パスワード変更</h2>
      <AccountForm
        fields={[
          {
            name: "currentPassword",
            label: "現在のパスワード",
            type: "password",
            autoComplete: "current-password",
            schema: z.string().min(1, "現在のパスワードを入力してください。"),
          },
          { ...passwordField, label: "新しいパスワード" },
          confirmField,
        ]}
        submitLabel="パスワードを変更"
        onSubmit={async (values) => {
          checkAuthResult(
            await authClient.changePassword({
              currentPassword: values.currentPassword,
              newPassword: values.password,
              revokeOtherSessions: true,
            }),
          );
          return "パスワードを変更し、他の端末のセッションを終了しました。";
        }}
      />
    </main>
  );
}
