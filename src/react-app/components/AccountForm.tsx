import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import type { AccountValues, AccountField } from "../lib/account-fields";

export default function AccountForm({ fields, initialValues, submitLabel, onSubmit }: {
  fields: AccountField[]; initialValues?: Partial<AccountValues>; submitLabel: string;
  onSubmit: (values: AccountValues) => Promise<string | void>;
}) {
  const id = useId();
  const [message, setMessage] = useState("");
  const { register, handleSubmit, getValues, setError, formState: { errors, isSubmitting } } = useForm<AccountValues>({
    defaultValues: { name: "", email: "", password: "", currentPassword: "", confirmPassword: "", ...initialValues },
  });
  return (
    <form
      className="author-form"
      noValidate
      onSubmit={handleSubmit(async (values) => {
        setMessage("");
        try {
          const parsed = { ...values };
          for (const field of fields)
            parsed[field.name] = field.schema.parse(values[field.name]);
          setMessage((await onSubmit(parsed)) ?? "");
        } catch (error) {
          setError("root", {
            message:
              error instanceof Error ? error.message : "通信に失敗しました。",
          });
        }
      })}
    >
      <fieldset disabled={isSubmitting}>
        {fields.map((field) => (
          <div key={field.name} className="account-field">
            <label htmlFor={`${id}-${field.name}`}>{field.label}</label>
            <input
              id={`${id}-${field.name}`}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              {...register(field.name, {
                validate: (value) => {
                  const result = field.schema.safeParse(value);
                  if (!result.success) return result.error.issues[0].message;
                  if (
                    field.name === "confirmPassword" &&
                    value !== getValues("password")
                  )
                    return "パスワードが一致しません。";
                  return true;
                },
              })}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={
                errors[field.name] ? `${id}-${field.name}-error` : undefined
              }
            />
            {errors[field.name] && (
              <p id={`${id}-${field.name}-error`} role="alert">
                {errors[field.name]?.message}
              </p>
            )}
          </div>
        ))}
        {errors.root && <p role="alert">{errors.root.message}</p>}
        {message && <p role="status">{message}</p>}
        <button type="submit">
          {isSubmitting ? "処理中..." : submitLabel}
        </button>
      </fieldset>
    </form>
  );
}
