import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import AuthorForm from "./AuthorForm";
import { birthdayValue, saveAuthor, type AuthorInput } from "./api";
import { authorKeys, authorQuery } from "./queries";

export default function AuthorEdit() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const client = useQueryClient();
  const query = useQuery(authorQuery(id));
  const mutation = useMutation({
    mutationFn: (input: AuthorInput) => saveAuthor(input, id),
    onSuccess: async (author) => {
      await client.cancelQueries({ queryKey: authorKeys.detail(id) });
      client.setQueryData(authorKeys.detail(id), author);
      await client.invalidateQueries({ queryKey: authorKeys.list });
      navigate(`/authors/${id}`, { replace: true });
    },
  });
  return (
    <main className="authors-page">
      <Link to="/authors">← 著者一覧</Link>
      <h1>著者の編集</h1>
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
        <AuthorForm
          key={id}
          initialValues={{
            name: query.data.name,
            birthday: birthdayValue(query.data.birthday),
          }}
          cancelTo={`/authors/${id}`}
          submitLabel="保存"
          error={mutation.error?.message}
          onSubmit={async (values) => {
            try {
              await mutation.mutateAsync({
                name: values.name,
                birthday: values.birthday
                  ? `${values.birthday}T00:00:00.000Z`
                  : null,
              });
            } catch {
              /* エラーは mutation.error で表示し、入力値を保持する。 */
            }
          }}
        />
      )}
    </main>
  );
}
