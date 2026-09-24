/** Feature data for QR checkpoints, chatbot, heatmap, offline emergency, concepts. */

export type QrCheckpoint = {
  id: string;
  code: string;
  name: string;
  zone: string;
  tip: string;
  nearestHelp: string;
  lat: number;
  lng: number;
};

export type ChatFaq = {
  id: string;
  keywords: string[];
  questionKey:
    | "chatFaq1Q"
    | "chatFaq2Q"
    | "chatFaq3Q"
    | "chatFaq4Q"
    | "chatFaq5Q"
    | "chatFaq6Q"
    | "chatFaq7Q"
    | "chatFaq8Q";
  answerKey:
    | "chatFaq1A"
    | "chatFaq2A"
    | "chatFaq3A"
    | "chatFaq4A"
    | "chatFaq5A"
    | "chatFaq6A"
    | "chatFaq7A"
    | "chatFaq8A";
};

export type HeatSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  reportCount: number;
  topConcern: string;
  intensity: "low" | "medium" | "high";
};

export type SafeRoute = {
  id: string;
  name: string;
  from: string;
  to: string;
  minutes: number;
  lighting: "Good" | "Fair" | "Poor";
  notes: string;
  waypoints: { lat: number; lng: number }[];
};

export type OfflineEmergencyItem = {
  id: string;
  category: string;
  title: string;
  body: string;
  phone?: string;
};

export const QR_CHECKPOINTS: QrCheckpoint[] = [
  {
    id: "QR-LIB",
    code: "SB-QR-LIBRARY",
    name: "Library entrance",
    zone: "Academic Core",
    tip: "Well-lit foyer with night staff until 22:00. Prefer this entrance after dark.",
    nearestHelp: "Library help desk · Campus Security 2 min walk",
    lat: -33.9608,
    lng: 25.6162,
  },
  {
    id: "QR-NRES",
    code: "SB-QR-NORTH-RES",
    name: "North Residence desk",
    zone: "North Residence",
    tip: "Scan here when starting a Walk With Me from residence after dusk.",
    nearestHelp: "North Residence security desk",
    lat: -33.9596,
    lng: 25.6174,
  },
  {
    id: "QR-GATE",
    code: "SB-QR-MAIN-GATE",
    name: "Main Gate guard house",
    zone: "Main Gate",
    tip: "24/7 guard presence. Safe pickup / drop-off point.",
    nearestHelp: "Main Gate guards on duty",
    lat: -33.9632,
    lng: 25.6139,
  },
  {
    id: "QR-SCI",
    code: "SB-QR-SCIENCE",
    name: "Science Building south door",
    zone: "Academic Core",
    tip: "Rear path lighting is limited — use the front colonnade instead.",
    nearestHelp: "Security Post B · first aid kit inside foyer",
    lat: -33.9612,
    lng: 25.6171,
  },
  {
    id: "QR-SOUTH",
    code: "SB-QR-SOUTH-PARK",
    name: "South Parking shuttle stop",
    zone: "South Parking",
    tip: "Wait under the lit canopy. Share your shuttle ETA with a trusted contact.",
    nearestHelp: "South gate guard house",
    lat: -33.9638,
    lng: 25.6158,
  },
  {
    id: "QR-SC",
    code: "SB-QR-STUDENT-CENTRE",
    name: "Student Centre courtyard",
    zone: "Student Centre",
    tip: "Busy during the day. After 20:00 prefer the lit west corridor.",
    nearestHelp: "Student Centre security office",
    lat: -33.9621,
    lng: 25.6148,
  },
];

export const CHATBOT_FAQS: ChatFaq[] = [
  {
    id: "FAQ-1",
    keywords: ["emergency", "help", "sos", "panic", "unsafe", "incedo", "thuso", "aide", "ayuda", "msaada"],
    questionKey: "chatFaq1Q",
    answerKey: "chatFaq1A",
  },
  {
    id: "FAQ-2",
    keywords: ["walk", "timer", "buddy", "night", "dark", "hamba", "sepela", "marche", "camina"],
    questionKey: "chatFaq2Q",
    answerKey: "chatFaq2A",
  },
  {
    id: "FAQ-3",
    keywords: ["report", "anonymous", "harassment", "theft", "ingxelo"],
    questionKey: "chatFaq3Q",
    answerKey: "chatFaq3A",
  },
  {
    id: "FAQ-4",
    keywords: ["security", "phone", "number", "call", "ukhuseleko", "seguridad"],
    questionKey: "chatFaq4Q",
    answerKey: "chatFaq4A",
  },
  {
    id: "FAQ-5",
    keywords: ["counselling", "counseling", "mental", "wellness", "sadag"],
    questionKey: "chatFaq5Q",
    answerKey: "chatFaq5A",
  },
  {
    id: "FAQ-6",
    keywords: ["qr", "checkpoint", "scan", "skena"],
    questionKey: "chatFaq6Q",
    answerKey: "chatFaq6A",
  },
  {
    id: "FAQ-7",
    keywords: ["silent", "discreet", "quiet", "ethuleyo", "silencioso"],
    questionKey: "chatFaq7Q",
    answerKey: "chatFaq7A",
  },
  {
    id: "FAQ-8",
    keywords: ["offline", "no network", "data", "intanethi"],
    questionKey: "chatFaq8Q",
    answerKey: "chatFaq8A",
  },
];

export const HEATMAP_SPOTS: HeatSpot[] = [
  {
    id: "HEAT-1",
    name: "Science Building rear path",
    lat: -33.9619,
    lng: 25.6168,
    reportCount: 14,
    topConcern: "Poor lighting",
    intensity: "high",
  },
  {
    id: "HEAT-2",
    name: "North Parking Block C",
    lat: -33.9628,
    lng: 25.6142,
    reportCount: 11,
    topConcern: "Suspicious activity",
    intensity: "high",
  },
  {
    id: "HEAT-3",
    name: "Residence Hall B approach",
    lat: -33.9602,
    lng: 25.6151,
    reportCount: 8,
    topConcern: "Harassment reports",
    intensity: "medium",
  },
  {
    id: "HEAT-4",
    name: "South Parking edge",
    lat: -33.9635,
    lng: 25.616,
    reportCount: 5,
    topConcern: "Isolated waiting area",
    intensity: "medium",
  },
  {
    id: "HEAT-5",
    name: "Auditorium side lane",
    lat: -33.961,
    lng: 25.6155,
    reportCount: 3,
    topConcern: "Infrastructure",
    intensity: "low",
  },
];

export const SAFE_ROUTES: SafeRoute[] = [
  {
    id: "ROUTE-1",
    name: "Library → North Residence (lit)",
    from: "Library",
    to: "North Residence",
    minutes: 8,
    lighting: "Good",
    notes: "Follow the main academic spine; avoid the Science rear cut-through.",
    waypoints: [
      { lat: -33.9608, lng: 25.6162 },
      { lat: -33.9602, lng: 25.6168 },
      { lat: -33.9596, lng: 25.6174 },
    ],
  },
  {
    id: "ROUTE-2",
    name: "Student Centre → Main Gate",
    from: "Student Centre",
    to: "Main Gate",
    minutes: 6,
    lighting: "Good",
    notes: "Use the west colonnade past Security Post A.",
    waypoints: [
      { lat: -33.9621, lng: 25.6148 },
      { lat: -33.9626, lng: 25.6143 },
      { lat: -33.9632, lng: 25.6139 },
    ],
  },
  {
    id: "ROUTE-3",
    name: "Science → South Parking (recommended)",
    from: "Science Building",
    to: "South Parking",
    minutes: 7,
    lighting: "Fair",
    notes: "Prefer front plaza then south spine; skip the dark east service road.",
    waypoints: [
      { lat: -33.9612, lng: 25.6171 },
      { lat: -33.962, lng: 25.6164 },
      { lat: -33.9638, lng: 25.6158 },
    ],
  },
  {
    id: "ROUTE-4",
    name: "North Residence → Main Gate",
    from: "North Residence",
    to: "Main Gate",
    minutes: 12,
    lighting: "Good",
    notes: "Best after dusk with Walk With Me enabled.",
    waypoints: [
      { lat: -33.9596, lng: 25.6174 },
      { lat: -33.961, lng: 25.6158 },
      { lat: -33.9632, lng: 25.6139 },
    ],
  },
];

export const OFFLINE_EMERGENCY: OfflineEmergencyItem[] = [
  {
    id: "OE-1",
    category: "Call now",
    title: "Campus Security",
    body: "24/7 control room. Share your location and nearest landmark.",
    phone: "+27 41 504 2000",
  },
  {
    id: "OE-2",
    category: "Call now",
    title: "SAP Emergency",
    body: "National emergency number when life or safety is at immediate risk.",
    phone: "10111",
  },
  {
    id: "OE-3",
    category: "Call now",
    title: "Campus Health Clinic",
    body: "Medical support on campus during clinic hours; ask security after hours.",
    phone: "+27 41 504 2174",
  },
  {
    id: "OE-4",
    category: "Call now",
    title: "Student Counselling",
    body: "Confidential counselling Mon–Fri 08:00–16:30.",
    phone: "+27 41 504 2511",
  },
  {
    id: "OE-5",
    category: "Call now",
    title: "SADAG Crisis Line",
    body: "24/7 mental health crisis support.",
    phone: "0800 567 567",
  },
  {
    id: "OE-6",
    category: "Steps",
    title: "If you feel followed",
    body: "Do not go home alone. Head to a lit help point (Library, Main Gate, Residence desk). Hold Help if you need security notified. Trust your instincts.",
  },
  {
    id: "OE-7",
    category: "Steps",
    title: "If you are injured",
    body: "Call Campus Health or Security. Stay where responders can find you if it is safe. Ask a passer-by to wait with you in a public area.",
  },
  {
    id: "OE-8",
    category: "Steps",
    title: "After a Help alert",
    body: "Stay on campus in a public place if possible. You can cancel if it was accidental. Support services remain available whether or not you continue the alert.",
  },
];

export const WEARABLE_CONCEPT = {
  title: "Wearable panic button",
  summary:
    "Concept: a campus-approved smartwatch or band can trigger the same Help flow with a long-press or double-tap, even when the phone is in a bag.",
  capabilities: [
    "Long-press triggers silent or standard Help (based on your settings)",
    "Sends last known GPS from the paired phone",
    "Optional haptic-only confirmation in silent mode",
    "Low-battery warning syncs with Battery-aware safety mode",
    "Works as a companion — phone app remains the primary notifier",
  ],
  pairingSteps: [
    "Enable Bluetooth and open Safety Settings → Wearable panic",
    "Put the watch/band in pairing mode",
    "Confirm the campus safety profile on both devices",
    "Test a cancelled Help hold so you know the gesture",
  ],
  status: "Prototype UI only — no live BLE pairing in this build.",
};

export const SECURITY_INTEGRATION = {
  title: "Campus security integration",
  summary:
    "Concept of how SafetyBuddy connects to the campus protection control room and patrol apps.",
  channels: [
    {
      name: "Help / SOS alerts",
      detail:
        "Encrypted push into the responder queue with student alias, GPS, battery, and silent-mode flag.",
    },
    {
      name: "Walk With Me ETA miss",
      detail:
        "Optional escalation to control room if the journey timer expires without check-in.",
    },
    {
      name: "Anonymous reports",
      detail:
        "Tickets appear on the admin board without identity unless follow-up is requested.",
    },
    {
      name: "Heatmap intelligence",
      detail:
        "Aggregated concern density informs patrol routing — individuals are not exposed.",
    },
    {
      name: "QR checkpoint pings",
      detail:
        "Optional “I’m here” breadcrumbs for night escorts without continuous tracking.",
    },
  ],
  status:
    "Demo uses mock incidents on the Responder Dashboard. Production would use university SSO and the SQL-backed ops API.",
};

export function matchChatbot(query: string): ChatFaq {
  const q = query.toLowerCase().trim();
  if (!q) return CHATBOT_FAQS[0];
  let best = CHATBOT_FAQS[0];
  let score = 0;
  for (const faq of CHATBOT_FAQS) {
    let s = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw.toLowerCase())) s += 2;
    }
    if (s > score) {
      score = s;
      best = faq;
    }
  }
  return best;
}

export function findCheckpointByCode(raw: string): QrCheckpoint | null {
  const data = raw.trim().toUpperCase();
  return (
    QR_CHECKPOINTS.find(
      (c) =>
        c.code === data ||
        data.includes(c.code) ||
        data.endsWith(c.id) ||
        data.includes(c.id)
    ) ?? null
  );
}
