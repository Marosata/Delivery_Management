export type UserRole = "admin" | "livreur" | "client";

export type TransportStatus = "disponible" | "en_livraison" | "pause" | "hors_ligne";

export type CommandeStatus = "en_attente" | "assignee" | "en_cours" | "livree" | "annulee";

export interface Profile {
  id: string;
  role: UserRole;
  created_at: string;
}

export interface TransportType {
  id: number;
  nom: string;
  vitesse_moyenne_kmh: number;
  capacite_max: number;
}

export interface Livreur {
  id: number;
  user_id: string;
  statut: TransportStatus;
  transport_type_id: number;
  latitude: number | null;
  longitude: number | null;
  actif: boolean;
}

export interface TypeCommande {
  id: number;
  nom: string;
  description: string | null;
  poids_max: number;
}

export interface Commande {
  id: number;
  client_id: string;
  type_commande_id: number;
  statut: CommandeStatus;
  livreur_id: number | null;
  prix: number;
  created_at: string;
  assigned_at: string | null;
  delivered_at: string | null;
  eta_minutes: number | null;
}

export type AdresseType = "depart" | "livraison";

export interface Adresse {
  id: number;
  commande_id: number;
  type: AdresseType;
  adresse_text: string;
  latitude: number;
  longitude: number;
}

