import type { Adresse } from "@/types/domain";

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteSummary {
  distanceKm: number;
  durationMinutes: number;
  geometry: RoutePoint[];
}

export interface RouteInput {
  origin: Pick<Adresse, "latitude" | "longitude">;
  destination: Pick<Adresse, "latitude" | "longitude">;
}

const routingBaseUrl =
  process.env.ROUTING_API_BASE_URL ?? "https://api.openrouteservice.org";
const routingApiKey = process.env.OPENROUTESERVICE_API_KEY;

if (!routingApiKey) {
  console.warn(
    "[mapsRoutingService] OPENROUTESERVICE_API_KEY non défini. Le calcul d'itinéraire sera indisponible.",
  );
}

export async function computeRoute(
  input: RouteInput,
): Promise<RouteSummary | null> {
  if (!routingApiKey) {
    return null;
  }

  const coordinates = [
    [input.origin.longitude, input.origin.latitude],
    [input.destination.longitude, input.destination.latitude],
  ];

  const url = `${routingBaseUrl}/v2/directions/driving-car`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: routingApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ coordinates }),
  });

  if (!response.ok) {
    throw new Error(
      `Erreur lors de l'appel à l'API de routing (status ${response.status})`,
    );
  }

  const data = (await response.json()) as {
    routes?: Array<{
      summary?: { distance?: number; duration?: number };
      geometry?: { coordinates?: Array<[number, number]> };
    }>;
  };

  const route = data.routes?.[0];
  if (!route || !route.summary) {
    return null;
  }

  const distanceKm = (route.summary.distance ?? 0) / 1000;
  const durationMinutes = (route.summary.duration ?? 0) / 60;

  const geometry: RoutePoint[] =
    route.geometry?.coordinates?.map(([lng, lat]) => ({
      latitude: lat,
      longitude: lng,
    })) ?? [];

  return {
    distanceKm,
    durationMinutes,
    geometry,
  };
}

