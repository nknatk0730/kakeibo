import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { authorKeys, authorQuery } from "./queries";
import { birthdayValue, deleteAuthor } from "./api";

export default function AuthorDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const query = useQuery(authorQuery(id));
  const deletion = useMutation({
    mutationFn: () => deleteAuthor(id),
    onSuccess: async () => {
      navigate("/authors", { replace: true });
      await client.cancelQueries({ queryKey: authorKeys.detail(id) });
      client.removeQueries({ queryKey: authorKeys.detail(id), exact: true });
      await client.invalidateQueries({ queryKey: authorKeys.list });
    },
  });
  return (
    <main className="authors-page">
      <Link to="/authors">← 著者一覧</Link>
      <h1>著者詳細</h1>
      {!id ? (
        <p role="alert">ID が指定されていません。</p>
      ) : query.isPending ? (
        <p role="status">読み込み中...</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{query.error.message}</p>
          <button onClick={() => void query.refetch()}>再試行</button>
        </div>
      ) : (
        <>
          <dl>
            <dt>名前</dt>
            <dd>{query.data.name}</dd>
            <dt>誕生日</dt>
            <dd>{birthdayValue(query.data.birthday) || "未設定"}</dd>
            <dt>登録日時</dt>
            <dd>{new Date(query.data.createdAt).toLocaleString("ja-JP")}</dd>
          </dl>
          <div className="author-actions">
            {!deletion.isPending && (
              <Link to={`/authors/${id}/edit`}>編集</Link>
            )}
            <button
              className="danger"
              disabled={deletion.isPending}
              onClick={() => {
                if (
                  window.confirm(
                    `「${query.data.name}」を削除しますか？この操作は取り消せません。`,
                  )
                )
                  deletion.mutate();
              }}
            >
              {deletion.isPending ? "削除中..." : "削除"}
            </button>
          </div>
          {deletion.isError && <p role="alert">{deletion.error.message}</p>}
        </>
      )}
    </main>
  );
}
