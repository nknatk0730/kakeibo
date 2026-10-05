import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Authors from "./pages/authors/Authors";
import AuthorDetail from "./pages/authors/AuthorDetail";
import AuthorCreate from "./pages/authors/AuthorCreate";
import AuthorEdit from "./pages/authors/AuthorEdit";
import Navigation from "./components/Navigation";
import RequireAuth from "./components/RequireAuth";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Account from "./pages/settings/Account";
import Users from "./pages/admin/users/Users";
import "./App.css";
import "./pages/authors/authors.css";

export default function App() {
  return <><Navigation /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route element={<RequireAuth />}>
      <Route path="/authors" element={<Authors />} />
      <Route path="/authors/new" element={<AuthorCreate />} />
      <Route path="/authors/:id" element={<AuthorDetail />} />
      <Route path="/authors/:id/edit" element={<AuthorEdit />} />
      <Route path="/settings/account" element={<Account />} />
    </Route>
    <Route element={<RequireAuth adminOnly />}><Route path="/admin/users" element={<Users />} /></Route>
    <Route path="*" element={<p>ページが見つかりません。</p>} />
  </Routes></>;
}
