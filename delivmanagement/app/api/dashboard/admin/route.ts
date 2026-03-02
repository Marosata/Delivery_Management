import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminDashboardStats } from "@/services/dashboardService";

export async function GET() {
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
    const stats = await getAdminDashboardStats(supabase);
    return NextResponse.json({ stats });
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du chargement du dashboard admin." },
      { status: 400 },
    );
  }
}

