import { queryOptions } from "@tanstack/react-query";
import { ApiError, getAuthor, listAuthors } from "./api";

export const authorKeys = {
  list: ["authors", "list"] as const,
  detail: (id: string) => ["authors", "detail", id] as const,
};
const retry = (count: number, error: Error) =>
  !(error instanceof ApiError && error.status < 500) && count < 2;
export const authorsQuery = queryOptions({
  queryKey: authorKeys.list,
  queryFn: ({ signal }) => listAuthors(signal),
  retry,
});
export const authorQuery = (id: string) => queryOptions({
  queryKey: authorKeys.detail(id),
  queryFn: ({ signal }) => getAuthor(id, signal),
  enabled: Boolean(id),
  retry,
});
