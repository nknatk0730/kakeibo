import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import AuthorForm from "./AuthorForm";
import { saveAuthor } from "./api";
import { authorKeys } from "./queries";

export default function AuthorCreate() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (input: Parameters<typeof saveAuthor>[0]) => saveAuthor(input),
    onSuccess: async (author) => {
      if (author.id) client.setQueryData(authorKeys.detail(author.id), author);
      await client.invalidateQueries({ queryKey: authorKeys.list });
      navigate(author.id ? `/authors/${author.id}` : "/authors", { replace: true });
    },
  });
  return (
    <main className="authors-page">
      <h1>著者の新規登録</h1>
      <AuthorForm
        cancelTo="/authors"
        submitLabel="登録"
        error={mutation.error?.message}
        onSubmit={async (values) => {
          try {
            await mutation.mutateAsync({
              name: values.name,
              ...(values.birthday
                ? { birthday: `${values.birthday}T00:00:00.000Z` }
                : {}),
            });
          } catch {
            /* エラーは mutation.error で表示し、入力値を保持する。 */
          }
        }}
      />
    </main>
  );
}
