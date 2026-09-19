/** Campus map types + fixed map center. Layer points/destinations come from SQL. */

export type MapPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type:
    | "danger"
    | "security"
    | "emergency"
    | "firstAid"
    | "safeZone"
    | "destination";
  description: string;
};

export type MapLayerKey =
  | "danger"
  | "security"
  | "emergency"
  | "firstAid"
  | "safeZone";

export const CAMPUS_CENTER = { lat: -33.9615, lng: 25.6155 };
