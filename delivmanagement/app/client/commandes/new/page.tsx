"use client";

import { useState } from "react";
import { MapView } from "@/components/map/MapView";

interface RouteResponse {
  route: {
    distanceKm: number;
    durationMinutes: number;
    geometry: { latitude: number; longitude: number }[];
  } | null;
}

export default function NewCommandePage() {
  const [typeCommandeId, setTypeCommandeId] = useState<string>("");
  const [prix, setPrix] = useState<string>("");
  const [pickupLat, setPickupLat] = useState<string>("");
  const [pickupLng, setPickupLng] = useState<string>("");
  const [deliveryLat, setDeliveryLat] = useState<string>("");
  const [deliveryLng, setDeliveryLng] = useState<string>("");
  const [pickupAdresse, setPickupAdresse] = useState("");
  const [deliveryAdresse, setDeliveryAdresse] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRouting, setIsRouting] = useState(false);
  const [routeResponse, setRouteResponse] = useState<RouteResponse | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);

  const center = {
    latitude: pickupLat ? Number(pickupLat) : 48.8566,
    longitude: pickupLng ? Number(pickupLng) : 2.3522,
  };

  async function handleComputeRoute() {
    setIsRouting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/routes/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: {
            latitude: Number(pickupLat),
            longitude: Number(pickupLng),
          },
          destination: {
            latitude: Number(deliveryLat),
            longitude: Number(deliveryLng),
          },
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const json = (await response.json()) as RouteResponse;
      setRouteResponse(json);
    } catch {
      setMessage("Impossible de calculer l'itinéraire.");
    } finally {
      setIsRouting(false);
    }
  }

  async function handleCreateCommande() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/commandes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_commande_id: Number(typeCommandeId),
          prix: Number(prix),
          pickup: {
            adresse_text: pickupAdresse,
            latitude: Number(pickupLat),
            longitude: Number(pickupLng),
          },
          delivery: {
            adresse_text: deliveryAdresse,
            latitude: Number(deliveryLat),
            longitude: Number(deliveryLng),
          },
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      setMessage("Commande créée avec succès.");
    } catch {
      setMessage("Erreur lors de la création de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Nouvelle commande
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Créez une commande client avec ses adresses et visualisez
            l&apos;itinéraire estimé.
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <section className="flex flex-col gap-4 rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="type-commande"
                  className="text-xs font-medium text-slate-200"
                >
                  Type de commande (ID)
                </label>
                <input
                  id="type-commande"
                  type="number"
                  value={typeCommandeId}
                  onChange={(event) => setTypeCommandeId(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  placeholder="1"
                />
              </div>
              <div>
                <label
                  htmlFor="prix"
                  className="text-xs font-medium text-slate-200"
                >
                  Prix (€)
                </label>
                <input
                  id="prix"
                  type="number"
                  min="0"
                  step="0.01"
                  value={prix}
                  onChange={(event) => setPrix(event.target.value)}
                  className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  placeholder="15.00"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Adresse de départ
                </p>
                <input
                  type="text"
                  value={pickupAdresse}
                  onChange={(event) => setPickupAdresse(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  placeholder="Adresse lisible"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    value={pickupLat}
                    onChange={(event) => setPickupLat(event.target.value)}
                    placeholder="Latitude"
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  />
                  <input
                    type="number"
                    value={pickupLng}
                    onChange={(event) => setPickupLng(event.target.value)}
                    placeholder="Longitude"
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Adresse de livraison
                </p>
                <input
                  type="text"
                  value={deliveryAdresse}
                  onChange={(event) => setDeliveryAdresse(event.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  placeholder="Adresse lisible"
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    value={deliveryLat}
                    onChange={(event) => setDeliveryLat(event.target.value)}
                    placeholder="Latitude"
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  />
                  <input
                    type="number"
                    value={deliveryLng}
                    onChange={(event) => setDeliveryLng(event.target.value)}
                    placeholder="Longitude"
                    className="h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-sm text-slate-50 outline-none ring-slate-500 placeholder:text-slate-500 focus:ring-2"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleComputeRoute}
                disabled={isRouting}
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-white disabled:opacity-60"
              >
                Calculer l&apos;itinéraire
              </button>
              <button
                type="button"
                onClick={handleCreateCommande}
                disabled={isSubmitting}
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-50 transition hover:bg-slate-800 disabled:opacity-60"
              >
                Créer la commande
              </button>
            </div>

            {message ? (
              <p className="mt-2 text-xs text-slate-300" aria-live="polite">
                {message}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl bg-slate-900/60 p-4 ring-1 ring-slate-800">
            <MapView
              center={center}
              pickup={
                pickupLat && pickupLng
                  ? {
                      latitude: Number(pickupLat),
                      longitude: Number(pickupLng),
                    }
                  : undefined
              }
              delivery={
                deliveryLat && deliveryLng
                  ? {
                      latitude: Number(deliveryLat),
                      longitude: Number(deliveryLng),
                    }
                  : undefined
              }
              routeGeometry={routeResponse?.route?.geometry}
              etaMinutes={routeResponse?.route?.durationMinutes ?? null}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

