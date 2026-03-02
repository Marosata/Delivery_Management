"use client";

import { useEffect, useState } from "react";

interface LivreurDashboardStats {
  livraisonsEffectuees: number;
  tempsMoyenLivraisonMinutes: number | null;
}

export default function LivreurDashboardPage() {
  const [livreurId, setLivreurId] = useState<string>("");
  const [stats, setStats] = useState<LivreurDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!livreurId) {
      return;
    }

    async function loadStats() {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ livreurId });
        const response = await fetch(`/api/dashboard/livreur?${params.toString()}`);
        if (!response.ok) {
          throw new Error();
        }
        const json = (await response.json()) as {
          stats: LivreurDashboardStats;
        };
        setStats(json.stats);
      } catch {
        setError("Impossible de charger les statistiques.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadStats();
  }, [livreurId]);

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Dashboard livreur
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Suivez vos livraisons et votre temps moyen de livraison.
            </p>
          </div>
        </header>

        <section className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="livreur-id"
              className="text-xs font-medium text-slate-200"
            >
              Identifiant livreur
            </label>
            <input
              id="livreur-id"
              type="number"
              value={livreurId}
              onChange={(event) => setLivreurId(event.target.value)}
              className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
              placeholder="Saisissez votre ID livreur"
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Livraisons effectuées
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {isLoading ? "…" : stats?.livraisonsEffectuees ?? 0}
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

