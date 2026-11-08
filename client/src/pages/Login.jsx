import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";

const field =
  "w-full bg-white border-2 border-ink rounded-md p-3 outline-none focus:shadow-hard transition-shadow";
const btnPrimary =
  "w-full bg-highlight text-ink font-bold border-2 border-ink rounded-md px-5 py-3 shadow-hard active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen font-sans flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight mb-1">
        Private notes
      </h1>
      <p className="text-ink/70 mb-8">Your notes stay private to you.</p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white border-2 border-ink rounded-md shadow-hard p-6 space-y-4"
      >
        <h2 className="text-xl font-bold">Log in</h2>

        {error && (
          <p className="bg-white text-danger font-semibold text-sm p-3 rounded-md border-2 border-danger">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={field}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={field}
        />

        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-sm text-center">
          No account yet?{" "}
          <Link
            to="/register"
            className="font-bold underline underline-offset-4 decoration-2 hover:bg-highlight"
          >
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}