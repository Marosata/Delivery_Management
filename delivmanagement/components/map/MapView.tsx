"use client";

import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import type { RoutePoint } from "@/services/mapsRoutingService";
import "leaflet/dist/leaflet.css";
import { type FC } from "react";

export interface MapMarker {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  center: MapMarker;
  pickup?: MapMarker;
  delivery?: MapMarker;
  routeGeometry?: RoutePoint[];
  etaMinutes?: number | null;
}

const DEFAULT_ZOOM = 13;

export const MapView: FC<MapViewProps> = ({
  center,
  pickup,
  delivery,
  routeGeometry,
  etaMinutes,
}) => {
  const routePositions =
    routeGeometry?.map((p) => [p.latitude, p.longitude] as [number, number]) ??
    [];

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="h-80 w-full overflow-hidden rounded-lg border border-slate-200">
        <MapContainer
          center={[center.latitude, center.longitude]}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pickup ? (
            <Marker position={[pickup.latitude, pickup.longitude]} />
          ) : null}
          {delivery ? (
            <Marker position={[delivery.latitude, delivery.longitude]} />
          ) : null}
          {routePositions.length > 1 ? (
            <Polyline positions={routePositions} color="#2563eb" />
          ) : null}
        </MapContainer>
      </div>
      {typeof etaMinutes === "number" ? (
        <p className="text-sm text-slate-600">
          ETA estimée :{" "}
          <span className="font-semibold">
            {Math.round(etaMinutes)} minutes
          </span>
        </p>
      ) : null}
    </div>
  );
};

