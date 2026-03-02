import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Commande,
  Livreur,
  TransportType,
  TypeCommande,
} from "@/types/domain";

interface AssignmentInput {
  commandeId: number;
}

interface AssignmentResult {
  commande: Commande;
  livreur: Livreur | null;
}

interface ScoredLivreur {
  livreur: Livreur;
  transport: TransportType;
  score: number;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function assignCommandeToBestLivreur(
  supabase: SupabaseClient,
  input: AssignmentInput,
): Promise<AssignmentResult> {
  const { commandeId } = input;

  const { data: commande, error: commandeError } = await supabase
    .from("commandes")
    .select(
      `
      *,
      type_commande: type_commandes (*),
      adresses: adresses (*)
    `,
    )
    .eq("id", commandeId)
    .single();

  if (commandeError || !commande) {
    throw new Error("Commande introuvable pour l'assignation.");
  }

  const pickupAdresse = (commande.adresses as Array<{ type: string; latitude: number; longitude: number }>).find(
    (addr) => addr.type === "depart",
  );

  if (!pickupAdresse) {
    throw new Error("Aucune adresse de départ trouvée pour la commande.");
  }

  const { data: livreurs, error: livreursError } = await supabase
    .from("livreurs")
    .select(
      `
      *,
      transport_types (*)
    `,
    )
    .eq("statut", "disponible")
    .eq("actif", true);

  if (livreursError) {
    throw new Error("Erreur lors de la récupération des livreurs disponibles.");
  }

  if (!livreurs || livreurs.length === 0) {
    return { commande, livreur: null };
  }

  const typeCommande = commande.type_commande as TypeCommande | null;
  const scoredLivreurs: ScoredLivreur[] = [];

  for (const livreurWithTransport of livreurs as Array<
    Livreur & { transport_types: TransportType | null }
  >) {
    const { latitude, longitude, transport_types: transport } = livreurWithTransport;

    if (
      latitude === null ||
      longitude === null ||
      !transport ||
      (typeCommande && typeCommande.poids_max > transport.capacite_max)
    ) {
      continue;
    }

    const distanceKm = haversineDistanceKm(
      pickupAdresse.latitude,
      pickupAdresse.longitude,
      latitude,
      longitude,
    );

    const vitesse = transport.vitesse_moyenne_kmh;
    if (vitesse <= 0) {
      continue;
    }

    const score = distanceKm / vitesse;
    scoredLivreurs.push({
      livreur: livreurWithTransport,
      transport,
      score,
    });
  }

  if (scoredLivreurs.length === 0) {
    return { commande, livreur: null };
  }

  scoredLivreurs.sort((a, b) => a.score - b.score);
  const best = scoredLivreurs[0];

  const { data: updatedCommande, error: updateError } = await supabase
    .from("commandes")
    .update({
      statut: "assignee",
      livreur_id: best.livreur.id,
      assigned_at: new Date().toISOString(),
      eta_minutes: Math.round(best.score * 60),
    })
    .eq("id", commandeId)
    .select("*")
    .single();

  if (updateError || !updatedCommande) {
    throw new Error("Erreur lors de la mise à jour de la commande assignée.");
  }

  return {
    commande: updatedCommande as Commande,
    livreur: best.livreur,
  };
}

