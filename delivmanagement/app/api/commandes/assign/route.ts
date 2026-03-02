import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { assignCommandeIntelligemment } from "@/services/commandesService";

const bodySchema = z.object({
  commandeId: z.number().int().positive(),
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

    const result = await assignCommandeIntelligemment(
      supabase,
      parsed.commandeId,
    );

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de l'assignation de la commande." },
      { status: 400 },
    );
  }
}

