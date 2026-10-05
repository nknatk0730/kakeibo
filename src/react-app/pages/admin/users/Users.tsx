import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient, checkAuthResult } from "../../../lib/auth-client";
export default function Users() {
  const { data: session } = authClient.useSession();
  const [page, setPage] = useState(0);
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "users", page], retry: false,
    queryFn: async () => checkAuthResult(await authClient.admin.listUsers({ query: { limit: 20, offset: page * 20, sortBy: "createdAt", sortDirection: "desc" } })),
  });
  const mutation = useMutation({
    mutationFn: async ({ id, banned }: { id: string; banned: boolean }) => {
      if (banned) checkAuthResult(await authClient.admin.unbanUser({ userId: id }));
      else checkAuthResult(await authClient.admin.banUser({ userId: id, banReason: "管理者による利用停止" }));
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
  return (
    <main className="authors-page">
      <h1>ユーザー管理</h1>
      <p>全員が共通の著者データを利用します。</p>
      {query.isPending ? (
        <p role="status">読み込み中...</p>
      ) : query.isError ? (
        <p role="alert">
          {query.error.message}
          <button onClick={() => void query.refetch()}>再試行</button>
        </p>
      ) : (
        <>
          <p>全 {query.data.total} 件</p>
          <div className="author-table">
            <table>
              <thead>
                <tr>
                  <th>名前 / メール</th>
                  <th>権限</th>
                  <th>状態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {query.data.users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.name}
                      <br />
                      {user.email}
                    </td>
                    <td>{user.role ?? "user"}</td>
                    <td>
                      {user.banned
                        ? "利用停止"
                        : user.emailVerified
                          ? "利用可能"
                          : "メール未確認"}
                    </td>
                    <td>
                      {user.id === session?.user.id ||
                      user.role?.split(",").includes("admin") ? (
                        "—"
                      ) : (
                        <button
                          disabled={mutation.isPending}
                          onClick={() => {
                            if (
                              window.confirm(
                                `${user.name} の利用を${user.banned ? "再開" : "停止"}しますか？`,
                              )
                            )
                              mutation.mutate({
                                id: user.id,
                                banned: Boolean(user.banned),
                              });
                          }}
                        >
                          {user.banned ? "利用再開" : "利用停止"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="author-actions">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              前へ
            </button>
            <span>{page + 1} ページ</span>
            <button
              disabled={(page + 1) * 20 >= query.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              次へ
            </button>
          </div>
        </>
      )}
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </main>
  );
}
