import { z } from "zod";
export type AccountValues = { name: string; email: string; password: string; currentPassword: string; confirmPassword: string };
type FieldName = keyof AccountValues;
export type AccountField = { name: FieldName; label: string; type?: "text" | "email" | "password"; autoComplete?: string; schema: z.ZodType<string> };
export const nameField: AccountField = { name: "name", label: "名前", autoComplete: "name", schema: z.string().trim().min(1, "名前を入力してください。").max(100, "100文字以内で入力してください。") };
export const emailField: AccountField = { name: "email", label: "メールアドレス", type: "email", autoComplete: "email", schema: z.email("メールアドレスを確認してください。") };
export const passwordField: AccountField = { name: "password", label: "パスワード", type: "password", autoComplete: "new-password", schema: z.string().min(8, "8文字以上で入力してください。").max(128, "128文字以内で入力してください。") };
export const confirmField: AccountField = { name: "confirmPassword", label: "パスワード（確認）", type: "password", autoComplete: "new-password", schema: z.string().min(1, "確認用パスワードを入力してください。") };

