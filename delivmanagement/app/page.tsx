import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6 lg:px-8">
        <header className="w-full max-w-4xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Delivery Management
            </h1>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-white sm:mt-0"
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-3 max-w-xl text-sm text-slate-300 sm:text-base">
            Plateforme de gestion des livreurs avec attribution intelligente des
            commandes, suivi temps réel et dashboards de performance.
          </p>
        </header>

        <section className="mt-10 grid w-full max-w-4xl gap-4 sm:mt-12 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-900/60 p-4 shadow-sm ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              Espace administrateur
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Suivi global des commandes, disponibilité des livreurs et
              performances de livraison.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-900/60 p-4 shadow-sm ring-1 ring-slate-800">
            <h2 className="text-sm font-semibold text-slate-100">
              Espace livreur
            </h2>
            <p className="mt-2 text-xs text-slate-300 sm:text-sm">
              Vision claire des tournées, mise à jour du statut et indicateurs
              de performance personnels.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

