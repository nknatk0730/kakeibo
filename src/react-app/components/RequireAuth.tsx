import { Navigate, Outlet, useLocation } from "react-router";
import { authClient } from "../lib/auth-client";
export default function RequireAuth({
  adminOnly = false,
}: {
  adminOnly?: boolean;
}) {
  const { data, isPending, error, refetch } = authClient.useSession();
  const location = useLocation();
  if (isPending) return <p role="status">ログイン状態を確認中...</p>;
  if (error)
    return (
      <div role="alert">
        ログイン状態を確認できません。
        <button onClick={() => void refetch()}>再試行</button>
      </div>
    );
  if (!data)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!data.user.emailVerified || data.user.banned)
    return <p role="alert">このアカウントでは利用できません。</p>;
  if (adminOnly && !data.user.role?.split(",").includes("admin"))
    return <p role="alert">管理者のみ利用できます。</p>;
  return <Outlet />;
}
