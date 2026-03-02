import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { updateCurrentLivreurStatus } from "@/services/livreursService";

const bodySchema = z.object({
  statut: z.enum(["disponible", "en_livraison", "pause", "hors_ligne"]),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
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

    const livreur = await updateCurrentLivreurStatus(supabase, parsed);

    return NextResponse.json({ livreur });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut du livreur." },
      { status: 400 },
    );
  }
}

