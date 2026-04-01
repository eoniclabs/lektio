import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useAuth } from "../../hooks/useAuth";

export function AuthModal() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const { login, register } = useAuth();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#2B9DB0]">Lektio</h1>
          <p className="mt-1 text-gray-500">Din AI-studiekompis</p>
        </div>

        {mode === "login" ? (
          <LoginForm
            onLogin={login}
            onSwitchToRegister={() => setMode("register")}
          />
        ) : (
          <RegisterForm
            onRegister={register}
            onSwitchToLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}
