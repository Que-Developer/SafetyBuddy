/** Simulated / dummy data for the SafetyBuddy hackathon prototype. No real data is collected. */

export type AlertLevel = "Information" | "Caution" | "Urgent";

export type SafetyAlert = {
  id: string;
  title: string;
  message: string;
  affectedArea: string;
  dateTime: string;
  recommendedAction: string;
  alertLevel: AlertLevel;
};

export type ReportType =
  | "Suspicious Activity"
  | "Harassment"
  | "Theft"
  | "Infrastructure Hazard"
  | "Medical Concern"
  | "Other";

export type ReportStatus =
  | "Submitted"
  | "Under Review"
  | "Escalated"
  | "Resolved";

export type IncidentReport = {
  id: string;
  reportType: ReportType;
  location: string;
  dateTime: string;
  description: string;
  photoAttached: boolean;
  followUpRequested: boolean;
  submitAnonymously: boolean;
  status: ReportStatus;
};

export type IncidentStatus =
  | "New"
  | "Acknowledged"
  | "Responder Dispatched"
  | "Resolved"
  | "False Alarm";

export type ResponderIncident = {
  id: string;
  studentName: string;
  alertType: string;
  location: string;
  timeTriggered: string;
  assignedResponder: string;
  notes: string;
  status: IncidentStatus;
};

export type Responder = {
  id: string;
  name: string;
  role: string;
  contact: string;
  availability: "Available" | "On Call" | "Busy" | "Off Duty";
};

export type EmergencyContact = {
  id: string;
  label: string;
  number: string;
};

export type CampusZone = {
  id: string;
  name: string;
  description: string;
  riskStatus: "Low" | "Moderate" | "Elevated";
  nearestHelpPoint: string;
  mapReference: string;
};

export type SafetyResource = {
  id: string;
  title: string;
  summary: string;
  body: string;
};

export type IncidentCategory = {
  id: string;
  name: string;
  active: boolean;
};

export const SAFETY_ALERTS: SafetyAlert[] = [
  {
    id: "ALT-001",
    title: "Construction near the Main Gate",
    message:
      "Pedestrian access is limited on the east side until Friday. Staff are directing foot traffic calmly around the worksite.",
    affectedArea: "Main Gate / East Pedestrian Path",
    dateTime: "2026-09-18 14:40",
    recommendedAction: "Allow extra travel time and use the west footpath.",
    alertLevel: "Caution",
  },
  {
    id: "ALT-002",
    title: "Pathway closed behind Science Building",
    message:
      "Grounds maintenance is underway. The route remains closed for safety; alternative paths are clearly marked.",
    affectedArea: "Science Building rear pathway",
    dateTime: "2026-09-18 13:05",
    recommendedAction: "Use the Auditorium route instead.",
    alertLevel: "Information",
  },
  {
    id: "ALT-003",
    title: "Increased patrols after dusk — North Residence",
    message:
      "Campus Protection is increasing visible patrols this evening following student reports. There is no confirmed immediate threat.",
    affectedArea: "North Residence precinct",
    dateTime: "2026-09-18 12:20",
    recommendedAction:
      "Walk with a buddy after dark and use well-lit paths. Call Campus Security if you feel unsafe.",
    alertLevel: "Urgent",
  },
];

export const SAMPLE_REPORT: IncidentReport = {
  id: "RPT-SIM-1042",
  reportType: "Suspicious Activity",
  location: "Library steps, South Campus",
  dateTime: "2026-09-18 15:10",
  description:
    "Simulated sample only. A person appeared to be following students near the library entrance.",
  photoAttached: false,
  followUpRequested: true,
  submitAnonymously: true,
  status: "Submitted",
};

export const REPORT_TYPES: ReportType[] = [
  "Suspicious Activity",
  "Harassment",
  "Theft",
  "Infrastructure Hazard",
  "Medical Concern",
  "Other",
];

export const CAMPUS_LOCATIONS = [
  "Main Gate",
  "Library, Ground Floor",
  "Science Building",
  "North Parking, Block C",
  "Residence Hall B",
  "Student Centre",
  "Sports Complex",
  "Auditorium",
];

export const RESPONDER_INCIDENTS: ResponderIncident[] = [
  {
    id: "A-204",
    studentName: "Anonymous #A-204",
    alertType: "SOS — Security",
    location: "North Parking, Block C",
    timeTriggered: "2 min ago",
    assignedResponder: "Unassigned",
    notes:
      "Caller reported being followed near the north lot. No further details yet.",
    status: "New",
  },
  {
    id: "A-203",
    studentName: "Sipho M.",
    alertType: "Medical",
    location: "Library, Ground Floor",
    timeTriggered: "8 min ago",
    assignedResponder: "Officer N. Jacobs",
    notes:
      "Student felt dizzy and requested first aid. Campus nurse en route.",
    status: "Responder Dispatched",
  },
  {
    id: "A-202",
    studentName: "Anonymous #A-198",
    alertType: "Harassment",
    location: "Residence Hall B, Room 42",
    timeTriggered: "15 min ago",
    assignedResponder: "Officer T. Smith",
    notes: "Verbal altercation reported. Responder currently en route.",
    status: "Acknowledged",
  },
  {
    id: "A-201",
    studentName: "Lerato K.",
    alertType: "False Alarm check",
    location: "Student Centre courtyard",
    timeTriggered: "45 min ago",
    assignedResponder: "Officer N. Jacobs",
    notes: "Accidental SOS press confirmed. Closed as false alarm.",
    status: "False Alarm",
  },
  {
    id: "A-200",
    studentName: "Anonymous #A-190",
    alertType: "Infrastructure",
    location: "Science Building stairwell",
    timeTriggered: "1 hr ago",
    assignedResponder: "Officer T. Smith",
    notes: "Broken lighting reported and secured. Incident resolved.",
    status: "Resolved",
  },
];

export const RESPONDERS: Responder[] = [
  {
    id: "RSP-01",
    name: "Officer N. Jacobs",
    role: "Campus Security Patrol",
    contact: "+27 41 000 1101",
    availability: "On Call",
  },
  {
    id: "RSP-02",
    name: "Officer T. Smith",
    role: "Residence Liaison",
    contact: "+27 41 000 1102",
    availability: "Available",
  },
  {
    id: "RSP-03",
    name: "Nurse A. Patel",
    role: "Campus Health",
    contact: "+27 41 000 1180",
    availability: "Available",
  },
  {
    id: "RSP-04",
    name: "Dispatcher R. Ndlovu",
    role: "Control Room",
    contact: "+27 41 000 1000",
    availability: "Busy",
  },
];

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: "EC-1", label: "Campus Security", number: "+27 41 504 2000" },
  { id: "EC-2", label: "Campus Health Clinic", number: "+27 41 504 2174" },
  { id: "EC-3", label: "Student Counselling", number: "+27 41 504 2511" },
  { id: "EC-4", label: "SAP Emergency", number: "10111" },
];

export const CAMPUS_ZONES: CampusZone[] = [
  {
    id: "ZN-1",
    name: "North Residence",
    description: "Residences, commons, and night lighting corridors",
    riskStatus: "Elevated",
    nearestHelpPoint: "North Residence security desk",
    mapReference: "NR-A1",
  },
  {
    id: "ZN-2",
    name: "Academic Core",
    description: "Library, Science, and Auditorium precinct",
    riskStatus: "Low",
    nearestHelpPoint: "Library ground-floor help desk",
    mapReference: "AC-B2",
  },
  {
    id: "ZN-3",
    name: "South Parking",
    description: "Parking lots and shuttle pickup points",
    riskStatus: "Moderate",
    nearestHelpPoint: "South gate guard house",
    mapReference: "SP-C3",
  },
];

export const SAFETY_RESOURCES: SafetyResource[] = [
  {
    id: "RES-1",
    title: "What to do in an emergency",
    summary: "Clear steps when you need help right away.",
    body: "Move to a lit, public area if you can. Press Help to alert campus security and your trusted contacts. Stay on the line if connected. You do not need to explain everything at once — asking for help is enough.",
  },
  {
    id: "RES-2",
    title: "How to contact campus security",
    summary: "One-tap numbers and what to expect.",
    body: "Use Call for Help for Campus Security. Share your location if prompted. Security can dispatch a patrol without requiring you to stay on a long call.",
  },
  {
    id: "RES-3",
    title: "Safe walking tips",
    summary: "Practical guidance for moving around campus.",
    body: "Prefer well-lit paths. Walk with someone when you can. Start Walk With Me so a trusted contact can watch your journey timer. Trust your instincts — leaving a situation early is always okay.",
  },
  {
    id: "RES-4",
    title: "Transport safety tips",
    summary: "Waiting for rides and shuttles.",
    body: "Wait in designated pickup zones. Share your trip details with a trusted contact. If a driver or situation feels wrong, cancel and move to a busy area or security point.",
  },
  {
    id: "RES-5",
    title: "Residence safety tips",
    summary: "Staying safer in and around residences.",
    body: "Do not prop open access doors. Report broken lights or locks. If someone unfamiliar follows you to your door, walk to a help point instead of entering alone.",
  },
  {
    id: "RES-6",
    title: "Supporting a friend who feels unsafe",
    summary: "How to help without taking over.",
    body: "Listen without judgement. Offer to walk with them or sit somewhere public. Help them contact security or counselling if they want. Respect their choices about what happens next.",
  },
  {
    id: "RES-7",
    title: "Counselling & wellness support",
    summary: "You are not alone after a difficult moment.",
    body: "Student Counselling and Campus Health are available. After any alert or report, SafetyBuddy offers a direct path to support services so you are not left on your own.",
  },
  {
    id: "RES-8",
    title: "After reporting an incident",
    summary: "What happens next, calmly explained.",
    body: "Your report helps campus identify patterns. You can request follow-up. Support services remain available whether or not you want further contact about the report.",
  },
];

export const WALK_DESTINATIONS = [
  "North Residence",
  "Library",
  "Student Centre",
  "South Parking / Shuttle",
  "Science Building",
  "Main Gate",
];

export const PRIVACY_SECTIONS = [
  {
    title: "What data would be collected",
    body: "In production: account identity, emergency alert details, location during an active alert or Walk With Me, trusted contact details you choose to save, and optional incident reports.",
  },
  {
    title: "Why it is needed",
    body: "So campus security can find you quickly, trusted contacts can be notified, and the university can improve campus safety — never for marketing.",
  },
  {
    title: "Who would have access",
    body: "Authorised campus security responders, designated student support staff when referrals are needed, and system administrators for configuration. Trusted contacts only receive what you enable.",
  },
  {
    title: "How long it would be kept",
    body: "Emergency records would be retained only as long as required by university policy and law, then securely deleted or anonymised.",
  },
  {
    title: "How it would be protected",
    body: "Encrypted transport (TLS), encrypted storage, role-based access, audit logs, and university-approved authentication in a production deployment.",
  },
  {
    title: "POPIA considerations",
    body: "Processing would follow purpose limitation, minimality, consent where required, security safeguards, and your rights to access or correct personal information through official university channels.",
  },
];

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { id: "CAT-1", name: "Suspicious Activity", active: true },
  { id: "CAT-2", name: "Harassment", active: true },
  { id: "CAT-3", name: "Theft", active: true },
  { id: "CAT-4", name: "Infrastructure Hazard", active: true },
  { id: "CAT-5", name: "Medical Concern", active: true },
  { id: "CAT-6", name: "Other", active: true },
];

export const SUPPORT_SERVICES = [
  {
    id: "SUP-1",
    title: "Student Counselling",
    detail: "Free confidential sessions — Mon–Fri 08:00–16:30",
    action: "Call +27 41 504 2511",
  },
  {
    id: "SUP-2",
    title: "Peer Support Network",
    detail: "Talk to trained student peers in a safe space",
    action: "Visit Student Centre Room 12",
  },
  {
    id: "SUP-3",
    title: "Campus Health Clinic",
    detail: "Medical and wellness support on campus",
    action: "Call +27 41 504 2174",
  },
  {
    id: "SUP-4",
    title: "24/7 Crisis Line (SADAG)",
    detail: "If you need someone to talk to right now",
    action: "Call 0800 567 567",
  },
];

export const INCIDENT_STATUS_FLOW: IncidentStatus[] = [
  "New",
  "Acknowledged",
  "Responder Dispatched",
  "Resolved",
  "False Alarm",
];

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  New: "#EF4444",
  Acknowledged: "#3B82F6",
  "Responder Dispatched": "#FACC15",
  Resolved: "#22C55E",
  "False Alarm": "#8A9BB3",
};
