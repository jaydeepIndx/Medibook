import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../api/auth";
import PasswordInput from "../components/PasswordInput";
import { getApiErrorMessage } from "../utils/apiError";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      login(result.access_token, result.user);
      navigate(
        result.user.role === "admin"
          ? "/admin"
          : result.user.role === "doctor"
            ? "/appointments"
            : "/doctors",
      );
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : getApiErrorMessage(
              requestError,
              "Unable to log in. Please try again.",
            ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 sm:p-8">
        <h1 className="text-3xl font-bold text-medibook-950">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to your MediBook account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </label>
          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <PasswordInput
              id="login-password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-medibook-500 focus:ring-4 focus:ring-medibook-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-medibook-600 px-4 py-3 font-semibold text-white transition hover:bg-medibook-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to MediBook?{" "}
          <Link
            to="/register"
            className="font-semibold text-medibook-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
