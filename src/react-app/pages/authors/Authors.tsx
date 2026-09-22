import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { authorsQuery } from "./queries";
import { birthdayValue } from "./api";

export default function Authors() {
  const query = useQuery(authorsQuery);
  return (
    <main className="authors-page">
      <div className="author-heading">
        <h1>著者一覧</h1>
        <Link to="/authors/new">新規登録</Link>
      </div>
      {query.isPending ? (
        <p role="status">読み込み中...</p>
      ) : query.isError ? (
        <div role="alert">
          <p>{query.error.message}</p>
          <button onClick={() => void query.refetch()}>再試行</button>
        </div>
      ) : query.data.length === 0 ? (
        <p>著者が登録されていません。「新規登録」から追加できます。</p>
      ) : (
        <div className="author-table">
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>誕生日</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {query.data.map((author, index) => (
                <tr key={author.id ?? `missing-${index}`}>
                  <td>{author.name}</td>
                  <td>{birthdayValue(author.birthday) || "未設定"}</td>
                  <td>
                    {author.id ? (
                      <Link
                        to={`/authors/${author.id}`}
                        aria-label={`${author.name}の詳細`}
                      >
                        詳細を見る
                      </Link>
                    ) : (
                      "ID 未設定"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
