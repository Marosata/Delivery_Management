import type { SupabaseClient } from "@supabase/supabase-js";
import type { Livreur, TransportStatus } from "@/types/domain";
import { ensureUserHasRole } from "./authService";

export async function getAvailableLivreurs(
  supabase: SupabaseClient,
): Promise<Livreur[]> {
  const { data, error } = await supabase
    .from("livreurs")
    .select("*")
    .eq("actif", true)
    .eq("statut", "disponible");

  if (error) {
    throw new Error(
      "Erreur lors de la récupération des livreurs disponibles.",
    );
  }

  return (data ?? []) as Livreur[];
}

interface UpdateLivreurStatusInput {
  statut: TransportStatus;
  latitude?: number | null;
  longitude?: number | null;
}

export async function updateCurrentLivreurStatus(
  supabase: SupabaseClient,
  input: UpdateLivreurStatusInput,
): Promise<Livreur> {
  const profile = await ensureUserHasRole(supabase, ["livreur"]);

  const { data: livreur, error: fetchError } = await supabase
    .from("livreurs")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  if (fetchError || !livreur) {
    throw new Error("Livreur introuvable pour l'utilisateur courant.");
  }

  const { statut, latitude = null, longitude = null } = input;

  const { data: updated, error: updateError } = await supabase
    .from("livreurs")
    .update({
      statut,
      latitude,
      longitude,
    })
    .eq("id", livreur.id)
    .select("*")
    .single();

  if (updateError || !updated) {
    throw new Error("Erreur lors de la mise à jour du statut du livreur.");
  }

  return updated as Livreur;
}

