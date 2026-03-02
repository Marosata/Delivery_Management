"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(mode: "signin" | "signup") {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error: signInError } =
          await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });
        if (signInError) {
          setError(signInError.message);
          return;
        }
      } else {
        const { error: signUpError } =
          await supabaseClient.auth.signUp({
            email,
            password,
          });
        if (signUpError) {
          setError(signUpError.message);
          return;
        }
      }

      router.push("/");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm rounded-2xl bg-slate-900/60 p-6 shadow-lg ring-1 ring-slate-800">
          <h1 className="text-xl font-semibold tracking-tight">
            Connexion à la plateforme
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Centralisez la gestion de vos livreurs et de vos commandes.
          </p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-slate-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                placeholder="vous@exemple.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-slate-200"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-10 rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="text-xs text-red-400" aria-live="assertive">
                {error}
              </p>
            ) : null}

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => handleLogin("signin")}
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:opacity-60"
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={() => handleLogin("signup")}
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-800 disabled:opacity-60"
              >
                Créer un compte
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

