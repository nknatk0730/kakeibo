import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { authClient, checkAuthResult } from "../lib/auth-client";
export default function Navigation() {
  const { data, isPending } = authClient.useSession();
  const client = useQueryClient();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <nav className="app-nav" aria-label="メインメニュー">
        <Link to="/">ホーム</Link>
        {data ? (
          <>
            <Link to="/authors">著者一覧</Link>
            <Link to="/settings/account">アカウント設定</Link>
            {data.user.role?.split(",").includes("admin") && (
              <Link to="/admin/users">ユーザー管理</Link>
            )}
            <span>{data.user.name}</span>
            <button
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  checkAuthResult(await authClient.signOut());
                  await client.cancelQueries();
                  client.clear();
                  navigate("/login", { replace: true });
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "ログアウトに失敗しました。",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              ログアウト
            </button>
          </>
        ) : (
          !isPending && (
            <>
              <Link to="/login">ログイン</Link>
              <Link to="/signup">新規登録</Link>
            </>
          )
        )}
      </nav>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
