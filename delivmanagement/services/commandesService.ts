import type { SupabaseClient } from "@supabase/supabase-js";
import type { Adresse, Commande, CommandeStatus } from "@/types/domain";
import { ensureUserHasRole } from "./authService";
import { assignCommandeToBestLivreur } from "./assignmentService";

export interface CreateCommandeInput {
  type_commande_id: number;
  prix: number;
  pickup: Pick<Adresse, "adresse_text" | "latitude" | "longitude">;
  delivery: Pick<Adresse, "adresse_text" | "latitude" | "longitude">;
}

export async function createCommandeForCurrentClient(
  supabase: SupabaseClient,
  input: CreateCommandeInput,
): Promise<Commande> {
  const profile = await ensureUserHasRole(supabase, ["client"]);

  const { data: commande, error } = await supabase
    .from("commandes")
    .insert({
      client_id: profile.id,
      type_commande_id: input.type_commande_id,
      prix: input.prix,
    })
    .select("*")
    .single();

  if (error || !commande) {
    throw new Error("Erreur lors de la création de la commande.");
  }

  const { error: addrError } = await supabase.from("adresses").insert([
    {
      commande_id: commande.id,
      type: "depart",
      adresse_text: input.pickup.adresse_text,
      latitude: input.pickup.latitude,
      longitude: input.pickup.longitude,
    },
    {
      commande_id: commande.id,
      type: "livraison",
      adresse_text: input.delivery.adresse_text,
      latitude: input.delivery.latitude,
      longitude: input.delivery.longitude,
    },
  ]);

  if (addrError) {
    throw new Error("Erreur lors de l'enregistrement des adresses.");
  }

  return commande as Commande;
}

interface UpdateCommandeStatusInput {
  commandeId: number;
  statut: CommandeStatus;
}

export async function updateCommandeStatus(
  supabase: SupabaseClient,
  input: UpdateCommandeStatusInput,
): Promise<Commande> {
  const { commandeId, statut } = input;

  const { data: updated, error } = await supabase
    .from("commandes")
    .update({
      statut,
      delivered_at: statut === "livree" ? new Date().toISOString() : null,
    })
    .eq("id", commandeId)
    .select("*")
    .single();

  if (error || !updated) {
    throw new Error("Erreur lors de la mise à jour de la commande.");
  }

  return updated as Commande;
}

export async function assignCommandeIntelligemment(
  supabase: SupabaseClient,
  commandeId: number,
): Promise<{ commande: Commande; livreurId: number | null }> {
  const result = await assignCommandeToBestLivreur(supabase, { commandeId });
  return {
    commande: result.commande,
    livreurId: result.livreur ? result.livreur.id : null,
  };
}

