import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { updateCommandeStatus } from "@/services/commandesService";

const bodySchema = z.object({
  commandeId: z.number().int().positive(),
  statut: z.enum(["en_attente", "assignee", "en_cours", "livree", "annulee"]),
});

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Configuration Supabase manquante." },
      { status: 500 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const json = await request.json();
    const parsed = bodySchema.parse(json);

    const commande = await updateCommandeStatus(supabase, parsed);

    return NextResponse.json({ commande });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut de la commande." },
      { status: 400 },
    );
  }
}

