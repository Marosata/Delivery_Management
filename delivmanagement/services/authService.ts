import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Profile, UserRole } from "@/types/domain";

export async function getCurrentUser(
  supabase: SupabaseClient,
): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new Error("Impossible de récupérer l'utilisateur courant.");
  }

  return user;
}

export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Erreur lors de la récupération du profil utilisateur.");
  }

  return data as Profile | null;
}

export async function ensureUserHasRole(
  supabase: SupabaseClient,
  allowedRoles: UserRole[],
): Promise<Profile> {
  const user = await getCurrentUser(supabase);
  if (!user) {
    throw new Error("Authentification requise.");
  }

  const profile = await getUserProfile(supabase, user.id);
  if (!profile || !allowedRoles.includes(profile.role)) {
    throw new Error("Accès refusé pour ce rôle.");
  }

  return profile;
}

