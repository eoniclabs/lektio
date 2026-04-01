import { useState } from "react";

interface LoginFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export function LoginForm({ onLogin, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message.includes("401")
            ? "Fel e-post eller lösenord"
            : err.message
          : "Något gick fel",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold text-gray-900">Logga in</h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="login-email" className="text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#2B9DB0] focus:ring-1 focus:ring-[#2B9DB0] focus:outline-none"
          placeholder="din@email.se"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
          Lösenord
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-[#2B9DB0] focus:ring-1 focus:ring-[#2B9DB0] focus:outline-none"
          placeholder="Minst 6 tecken"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-[#2B9DB0] px-4 py-2.5 font-medium text-white transition-colors hover:bg-[#248a9b] disabled:opacity-50"
      >
        {loading ? "Loggar in..." : "Logga in"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Har du inget konto?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-[#2B9DB0] hover:underline"
        >
          Registrera dig
        </button>
      </p>
    </form>
  );
}
