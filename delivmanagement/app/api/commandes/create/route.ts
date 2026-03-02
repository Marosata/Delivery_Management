import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createCommandeForCurrentClient } from "@/services/commandesService";

const bodySchema = z.object({
  type_commande_id: z.number().int().positive(),
  prix: z.number().nonnegative(),
  pickup: z.object({
    adresse_text: z.string().min(1),
    latitude: z.number(),
    longitude: z.number(),
  }),
  delivery: z.object({
    adresse_text: z.string().min(1),
    latitude: z.number(),
    longitude: z.number(),
  }),
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

    const commande = await createCommandeForCurrentClient(supabase, parsed);

    return NextResponse.json({ commande });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la création de la commande." },
      { status: 400 },
    );
  }
}

