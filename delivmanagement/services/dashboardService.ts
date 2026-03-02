import type { SupabaseClient } from "@supabase/supabase-js";

export interface AdminDashboardStats {
  totalCommandes: number;
  tempsMoyenLivraisonMinutes: number | null;
  tauxReussite: number | null;
}

export interface LivreurDashboardStats {
  livraisonsEffectuees: number;
  tempsMoyenLivraisonMinutes: number | null;
}

export async function getAdminDashboardStats(
  supabase: SupabaseClient,
): Promise<AdminDashboardStats> {
  const { data: totalData, error: totalError } = await supabase
    .from("commandes")
    .select("id", { count: "exact", head: true });

  if (totalError) {
    throw new Error("Erreur lors du calcul du nombre total de commandes.");
  }

  const totalCommandes = totalData?.length ?? 0;

  const { data: statsRows, error: statsError } = await supabase
    .from("commandes")
    .select("created_at, delivered_at, statut");

  if (statsError) {
    throw new Error("Erreur lors du calcul des statistiques de livraison.");
  }

  let deliveries = 0;
  let totalDurationMinutes = 0;
  let deliveredCount = 0;

  for (const row of statsRows ?? []) {
    if (row.statut === "livree" && row.delivered_at) {
      deliveries += 1;
      const created = new Date(row.created_at as string).getTime();
      const delivered = new Date(row.delivered_at as string).getTime();
      const duration = (delivered - created) / (1000 * 60);
      if (duration > 0) {
        totalDurationMinutes += duration;
        deliveredCount += 1;
      }
    }
  }

  const tempsMoyenLivraisonMinutes =
    deliveredCount > 0 ? totalDurationMinutes / deliveredCount : null;
  const tauxReussite =
    totalCommandes > 0 ? (deliveries / totalCommandes) * 100 : null;

  return {
    totalCommandes,
    tempsMoyenLivraisonMinutes,
    tauxReussite,
  };
}

export async function getLivreurDashboardStats(
  supabase: SupabaseClient,
  livreurId: number,
): Promise<LivreurDashboardStats> {
  const { data, error } = await supabase
    .from("commandes")
    .select("created_at, delivered_at, statut")
    .eq("livreur_id", livreurId);

  if (error) {
    throw new Error("Erreur lors du calcul des statistiques livreur.");
  }

  let livraisonsEffectuees = 0;
  let totalDurationMinutes = 0;

  for (const row of data ?? []) {
    if (row.statut === "livree" && row.delivered_at) {
      livraisonsEffectuees += 1;
      const created = new Date(row.created_at as string).getTime();
      const delivered = new Date(row.delivered_at as string).getTime();
      const duration = (delivered - created) / (1000 * 60);
      if (duration > 0) {
        totalDurationMinutes += duration;
      }
    }
  }

  const tempsMoyenLivraisonMinutes =
    livraisonsEffectuees > 0
      ? totalDurationMinutes / livraisonsEffectuees
      : null;

  return {
    livraisonsEffectuees,
    tempsMoyenLivraisonMinutes,
  };
}

