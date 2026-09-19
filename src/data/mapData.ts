/** Campus map points for SafetyBuddy — NMU Summerstrand-ish coordinates */

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

export const CAMPUS_CENTER = { lat: -33.9615, lng: 25.6155 };

export const CAMPUS_DESTINATIONS: MapPoint[] = [
  {
    id: "dest-library",
    name: "Library",
    lat: -33.9608,
    lng: 25.6162,
    type: "destination",
    description: "Main campus library",
  },
  {
    id: "dest-student-centre",
    name: "Student Centre",
    lat: -33.9621,
    lng: 25.6148,
    type: "destination",
    description: "Student services & food court",
  },
  {
    id: "dest-north-res",
    name: "North Residence",
    lat: -33.9596,
    lng: 25.6174,
    type: "destination",
    description: "North residence precinct",
  },
  {
    id: "dest-main-gate",
    name: "Main Gate",
    lat: -33.9632,
    lng: 25.6139,
    type: "destination",
    description: "Primary campus entrance",
  },
  {
    id: "dest-science",
    name: "Science Building",
    lat: -33.9612,
    lng: 25.6171,
    type: "destination",
    description: "Science faculty block",
  },
  {
    id: "dest-south-park",
    name: "South Parking",
    lat: -33.9638,
    lng: 25.6158,
    type: "destination",
    description: "South parking & shuttle point",
  },
];

export const MAP_LAYER_POINTS: MapPoint[] = [
  {
    id: "danger-1",
    name: "Reported: poorly lit path",
    lat: -33.9619,
    lng: 25.6168,
    type: "danger",
    description: "Student report — low lighting behind Science Building",
  },
  {
    id: "danger-2",
    name: "Reported: suspicious activity",
    lat: -33.9628,
    lng: 25.6142,
    type: "danger",
    description: "Student report — North Parking Block C area",
  },
  {
    id: "danger-3",
    name: "Reported: harassment zone",
    lat: -33.9602,
    lng: 25.6151,
    type: "danger",
    description: "Student report — Residence Hall B approach",
  },
  {
    id: "sec-1",
    name: "Security Post A",
    lat: -33.963,
    lng: 25.614,
    type: "security",
    description: "Campus Protection desk — Main Gate",
  },
  {
    id: "sec-2",
    name: "Security Post B",
    lat: -33.9605,
    lng: 25.6178,
    type: "security",
    description: "North Residence security desk",
  },
  {
    id: "emg-1",
    name: "Emergency Assembly",
    lat: -33.9616,
    lng: 25.615,
    type: "emergency",
    description: "Primary emergency assembly point",
  },
  {
    id: "aid-1",
    name: "First Aid — Clinic",
    lat: -33.961,
    lng: 25.6145,
    type: "firstAid",
    description: "Campus Health Clinic",
  },
  {
    id: "aid-2",
    name: "First Aid — Library",
    lat: -33.9607,
    lng: 25.616,
    type: "firstAid",
    description: "Library ground-floor first aid kit",
  },
  {
    id: "safe-1",
    name: "Safe Zone — Student Centre",
    lat: -33.962,
    lng: 25.6149,
    type: "safeZone",
    description: "Busy, well-lit public area",
  },
  {
    id: "safe-2",
    name: "Safe Zone — Library steps",
    lat: -33.9609,
    lng: 25.6163,
    type: "safeZone",
    description: "Monitored high-traffic area",
  },
];

export const MAP_WALK_CONTACTS = [
  {
    id: "c1",
    name: "Kutlwano",
    phone: "+27 82 111 2233",
    online: true,
    battery: 86,
    initial: "K",
    color: "#F5C842",
  },
  {
    id: "c2",
    name: "Ano",
    phone: "+27 83 444 5566",
    online: true,
    battery: 42,
    initial: "A",
    color: "#3B82F6",
  },
  {
    id: "c3",
    name: "Asanda",
    phone: "+27 84 777 8899",
    online: false,
    battery: 12,
    initial: "A",
    color: "#22C55E",
  },
];

export type MapLayerKey =
  | "security"
  | "emergency"
  | "firstAid"
  | "safeZone"
  | "danger";

export const MAP_LAYERS: { key: MapLayerKey; label: string; color: string }[] = [
  { key: "security", label: "Security Posts", color: "#F5C842" },
  { key: "emergency", label: "Emergency Post", color: "#EF4444" },
  { key: "firstAid", label: "First Aid Stations", color: "#22C55E" },
  { key: "safeZone", label: "Safe Zones", color: "#60A5FA" },
  { key: "danger", label: "Reported Concerns", color: "#EAB308" },
];
