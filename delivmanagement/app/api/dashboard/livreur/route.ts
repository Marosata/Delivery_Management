import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { getLivreurDashboardStats } from "@/services/dashboardService";

const querySchema = z.object({
  livreurId: z.coerce.number().int().positive(),
});

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.parse({
      livreurId: searchParams.get("livreurId"),
    });

    const stats = await getLivreurDashboardStats(supabase, parsed.livreurId);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement du dashboard livreur." },
      { status: 400 },
    );
  }
}

