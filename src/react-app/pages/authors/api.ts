import { z } from "zod";

const authorSchema = z.object({
  id: z.uuid().nullable(),
  name: z.string(),
  birthday: z.string().nullable(),
  createdAt: z.string(),
});
export type Author = z.infer<typeof authorSchema>;
export type AuthorInput = { name: string; birthday?: string | null };

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
async function request(path: string, options?: RequestInit) {
  const response = await fetch(`/api/authors${path}`, options);
  if (!response.ok) {
    const messages: Record<number, string> = {
      400: "入力内容を確認してください。",
      401: "ログインの有効期限が切れました。再度ログインしてください。",
      403: "この操作を行う権限がありません。",
      404: "著者が見つかりません。",
    };
    throw new ApiError(response.status, messages[response.status] ?? `通信に失敗しました（${response.status}）。`);
  }
  return response;
}
export async function listAuthors(signal?: AbortSignal) {
  return z.array(authorSchema).parse(await (await request("", { signal })).json());
}
export async function getAuthor(id: string, signal?: AbortSignal) {
  return authorSchema.parse(await (await request(`/${encodeURIComponent(id)}`, { signal })).json());
}
export async function saveAuthor(input: AuthorInput, id?: string) {
  const response = await request(id ? `/${encodeURIComponent(id)}` : "", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return authorSchema.parse(await response.json());
}
export async function deleteAuthor(id: string) {
  await request(`/${encodeURIComponent(id)}`, { method: "DELETE" });
}
export function birthdayValue(value: string | null) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
