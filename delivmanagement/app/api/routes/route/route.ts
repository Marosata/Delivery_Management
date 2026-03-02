import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeRoute } from "@/services/mapsRoutingService";

const bodySchema = z.object({
  origin: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  destination: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = bodySchema.parse(json);

    const route = await computeRoute({
      origin: parsed.origin,
      destination: parsed.destination,
    });

    return NextResponse.json({ route });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[routes/route] error", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul d'itinéraire." },
      { status: 400 },
    );
  }
}

