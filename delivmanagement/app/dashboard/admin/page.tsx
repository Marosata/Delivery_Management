"use client";

import { useEffect, useState } from "react";

interface AdminDashboardStats {
  totalCommandes: number;
  tempsMoyenLivraisonMinutes: number | null;
  tauxReussite: number | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/dashboard/admin", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error();
        }
        const json = (await response.json()) as { stats: AdminDashboardStats };
        setStats(json.stats);
      } catch {
        setError("Impossible de charger les statistiques.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadStats();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Dashboard administrateur
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Vue d&apos;ensemble des commandes et performances de livraison.
            </p>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total commandes
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {isLoading ? "…" : stats?.totalCommandes ?? 0}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Temps moyen de livraison
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {isLoading
                ? "…"
                : stats?.tempsMoyenLivraisonMinutes
                  ? `${Math.round(stats.tempsMoyenLivraisonMinutes)} min`
                  : "—"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Taux de réussite
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {isLoading
                ? "…"
                : stats?.tauxReussite !== null &&
                    typeof stats?.tauxReussite === "number"
                  ? `${Math.round(stats.tauxReussite)} %`
                  : "—"}
            </p>
          </div>
        </section>

        {error ? (
          <p className="mt-4 text-sm text-red-400" aria-live="assertive">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  );
}

