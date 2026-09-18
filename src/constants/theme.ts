export const COLORS = {
  // Brand — Safety Buddy splash / login mockups
  bg: "#FFD24C",
  bgDeep: "#F5C842",
  card: "#FFF4C2",
  cardAlt: "#FFE9A0",
  input: "#FFFFFF",

  navy: "#002B5B",
  navySoft: "#0A3A6E",
  text: "#0A0A3D",
  textMuted: "#4A4A6A",
  textDim: "#6B6B85",

  white: "#FFFFFF",
  black: "#000000",
  link: "#002B5B",
  accent: "#002B5B",
  accentSoft: "#FFF4C2",

  danger: "#E63946",
  dangerDark: "#C1121F",
  glow: "#FF4D2E",
  glowSoft: "#FF7A45",
  helpBlue: "#1A3A6E",
  success: "#22C55E",
  info: "#3B82F6",
  caution: "#F59E0B",
  urgent: "#EF4444",

  shadow: "#000000",

  // Security dashboards stay darker for urgency
  responderBg: "#0B1B3A",
  responderCard: "#162A52",
  responderMuted: "#8A9BB3",

  // Aliases used across older screens
  warmBg: "#FFD24C",
  warmCard: "#FFF4C2",
  warmText: "#0A0A3D",
  tile: "#FFE9A0",
  tileBorder: "rgba(0,43,91,0.12)",
  bgMid: "#FFE27A",
};

export const CARD_SHADOW = {
  shadowColor: COLORS.shadow,
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
  elevation: 5,
};

export const ALERT_LEVEL_COLORS = {
  Information: COLORS.info,
  Caution: COLORS.caution,
  Urgent: COLORS.urgent,
} as const;
