import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router";

const formSchema = z.object({
  name: z.string().trim().min(1, "名前を入力してください。"),
  birthday: z.union([z.literal(""), z.iso.date("正しい日付を入力してください。")]),
});
export type AuthorFormValues = z.infer<typeof formSchema>;

type Props = {
  initialValues?: AuthorFormValues;
  onSubmit: (values: AuthorFormValues) => Promise<void>;
  cancelTo: string;
  submitLabel: string;
  error?: string;
};
export default function AuthorForm({
  initialValues,
  onSubmit,
  cancelTo,
  submitLabel,
  error,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? { name: "", birthday: "" },
  });
  return (
    <form className="author-form" noValidate onSubmit={handleSubmit(onSubmit)}>
      <fieldset disabled={isSubmitting}>
        <label htmlFor="author-name">名前（必須）</label>
        <input
          id="author-name"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <p id="name-error" role="alert">
            {errors.name.message}
          </p>
        )}
        <label htmlFor="author-birthday">誕生日（任意）</label>
        <input
          id="author-birthday"
          type="date"
          {...register("birthday")}
          aria-invalid={Boolean(errors.birthday)}
          aria-describedby={errors.birthday ? "birthday-error" : undefined}
        />
        {errors.birthday && (
          <p id="birthday-error" role="alert">
            {errors.birthday.message}
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="author-actions">
          <button type="submit">
            {isSubmitting ? "保存中..." : submitLabel}
          </button>
          {!isSubmitting && <Link to={cancelTo}>キャンセル</Link>}
        </div>
      </fieldset>
    </form>
  );
}
