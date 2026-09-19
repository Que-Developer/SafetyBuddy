/** Campus map points for SafetyBuddy — Nelson Mandela University, Summerstrand (Gqeberha) */

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

/**
 * Midpoint between official NMU North Campus (33°59′54.88″S 25°40′19.90″E)
 * and South Campus (34°00′19.17″S 25°40′11.22″E).
 */
export const CAMPUS_CENTER = { lat: -34.00195, lng: 25.67099 };

export const CAMPUS_DESTINATIONS: MapPoint[] = [
  {
    id: "dest-library",
    name: "Library",
    lat: -34.0042,
    lng: 25.6702,
    type: "destination",
    description: "South Campus main library",
  },
  {
    id: "dest-student-centre",
    name: "Student Centre",
    lat: -34.005,
    lng: 25.6695,
    type: "destination",
    description: "Student services & food court",
  },
  {
    id: "dest-north-res",
    name: "North Residence",
    lat: -33.9975,
    lng: 25.673,
    type: "destination",
    description: "North Campus student village",
  },
  {
    id: "dest-main-gate",
    name: "Main Gate",
    lat: -34.0065,
    lng: 25.6688,
    type: "destination",
    description: "South Campus University Way entrance",
  },
  {
    id: "dest-science",
    name: "Science Building",
    lat: -34.0035,
    lng: 25.6715,
    type: "destination",
    description: "South Campus science faculty",
  },
  {
    id: "dest-south-park",
    name: "South Parking",
    lat: -34.0068,
    lng: 25.6705,
    type: "destination",
    description: "South parking & shuttle point",
  },
];

export const MAP_LAYER_POINTS: MapPoint[] = [
  {
    id: "danger-1",
    name: "Reported: poorly lit path",
    lat: -34.0038,
    lng: 25.6718,
    type: "danger",
    description: "Student report — low lighting behind Science Building",
  },
  {
    id: "danger-2",
    name: "Reported: suspicious activity",
    lat: -34.0062,
    lng: 25.6692,
    type: "danger",
    description: "Student report — South Parking Block C area",
  },
  {
    id: "danger-3",
    name: "Reported: harassment zone",
    lat: -33.9982,
    lng: 25.6724,
    type: "danger",
    description: "Student report — North Residence approach",
  },
  {
    id: "sec-1",
    name: "Security Post A",
    lat: -34.0064,
    lng: 25.6689,
    type: "security",
    description: "Campus Protection desk — Main Gate",
  },
  {
    id: "sec-2",
    name: "Security Post B",
    lat: -33.9978,
    lng: 25.6732,
    type: "security",
    description: "North Residence security desk",
  },
  {
    id: "emg-1",
    name: "Emergency Assembly",
    lat: -34.0025,
    lng: 25.6705,
    type: "emergency",
    description: "Primary emergency assembly point",
  },
  {
    id: "aid-1",
    name: "First Aid — Clinic",
    lat: -34.0048,
    lng: 25.6698,
    type: "firstAid",
    description: "Campus Health Clinic",
  },
  {
    id: "aid-2",
    name: "First Aid — Library",
    lat: -34.0041,
    lng: 25.6701,
    type: "firstAid",
    description: "Library ground-floor first aid kit",
  },
  {
    id: "safe-1",
    name: "Safe Zone — Student Centre",
    lat: -34.00495,
    lng: 25.66955,
    type: "safeZone",
    description: "Busy, well-lit public area",
  },
  {
    id: "safe-2",
    name: "Safe Zone — Library steps",
    lat: -34.00415,
    lng: 25.67025,
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
