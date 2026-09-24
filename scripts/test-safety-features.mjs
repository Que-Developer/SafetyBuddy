/**
 * Feature smoke tests for SafetyBuddy safety modules (no Expo runtime).
 * Usage: node scripts/test-safety-features.mjs
 */

import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

// ---- Inline mirrors of featureData helpers (TS can't import directly) ----
const QR_CHECKPOINTS = [
  { id: "QR-LIB", code: "SB-QR-LIBRARY", name: "Library entrance" },
  { id: "QR-NRES", code: "SB-QR-NORTH-RES", name: "North Residence desk" },
  { id: "QR-GATE", code: "SB-QR-MAIN-GATE", name: "Main Gate guard house" },
  { id: "QR-SCI", code: "SB-QR-SCIENCE", name: "Science Building south door" },
  { id: "QR-SOUTH", code: "SB-QR-SOUTH-PARK", name: "South Parking shuttle stop" },
  { id: "QR-SC", code: "SB-QR-STUDENT-CENTRE", name: "Student Centre courtyard" },
];

const CHATBOT_FAQS = [
  { keywords: ["emergency", "help", "sos", "panic", "unsafe"], question: "What should I do in an emergency?" },
  { keywords: ["walk", "timer", "buddy", "night", "dark"], question: "How does Walk With Me work?" },
  { keywords: ["report", "anonymous", "harassment", "theft"], question: "Can I report anonymously?" },
  { keywords: ["security", "phone", "number", "call"], question: "How do I contact campus security?" },
  { keywords: ["counselling", "counseling", "mental", "wellness", "sadag"], question: "Where can I get counselling support?" },
  { keywords: ["qr", "checkpoint", "scan"], question: "What are QR checkpoints?" },
  { keywords: ["silent", "discreet", "quiet"], question: "What is silent panic mode?" },
  { keywords: ["offline", "no network", "data"], question: "Does SafetyBuddy work offline?" },
];

function findCheckpointByCode(raw) {
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

function matchChatbot(query) {
  const q = query.toLowerCase().trim();
  if (!q) return CHATBOT_FAQS[0];
  let best = CHATBOT_FAQS[0];
  let score = 0;
  for (const faq of CHATBOT_FAQS) {
    let s = 0;
    for (const kw of faq.keywords) {
      if (q.includes(kw)) s += 2;
    }
    if (faq.question.toLowerCase().includes(q)) s += 3;
    if (s > score) {
      score = s;
      best = faq;
    }
  }
  return best;
}

const LOCALES = ["en", "xh", "ve", "nso", "af", "fr", "es", "pt", "zh", "ar", "sw"];

console.log("\nSafetyBuddy feature tests\n");

// 1. Source files exist
console.log("1) Feature screens & modules present");
const requiredFiles = [
  "src/app/qr-scan.tsx",
  "src/app/chatbot.tsx",
  "src/app/offline-emergency.tsx",
  "src/app/safe-routes.tsx",
  "src/app/heatmap.tsx",
  "src/app/wearable-panic.tsx",
  "src/app/security-integration.tsx",
  "src/app/safety-settings.tsx",
  "src/data/featureData.ts",
  "src/i18n/locales.ts",
  "src/i18n/LocaleContext.tsx",
  "src/context/SafetyModesContext.tsx",
];
for (const f of requiredFiles) {
  assert(existsSync(join(root, f)), `missing ${f}`);
}
ok(`${requiredFiles.length} feature files exist`);

// 2. QR checkpoint matching
console.log("2) QR checkpoint lookup");
assert(findCheckpointByCode("SB-QR-LIBRARY")?.name === "Library entrance", "library code");
assert(findCheckpointByCode("sb-qr-main-gate")?.id === "QR-GATE", "case-insensitive");
assert(findCheckpointByCode("garbage") === null, "unknown code");
ok("QR codes resolve correctly");

// 3. Chatbot keyword matching
console.log("3) Safety chatbot matching");
assert(matchChatbot("I need emergency help").question.includes("emergency"), "emergency");
assert(matchChatbot("anonymous report").question.includes("anonymously"), "anonymous");
assert(matchChatbot("silent panic").question.includes("silent"), "silent");
assert(matchChatbot("walk with me at night").question.includes("Walk With Me"), "walk");
ok("Chatbot returns approved topics");


// 4. Locales file coverage
console.log("4) Multi-language packs");
const localesSrc = readFileSync(join(root, "src/i18n/locales.ts"), "utf8");
for (const code of LOCALES) {
  assert(localesSrc.includes(`code: "${code}"`) || localesSrc.includes(`${code},`), `locale ${code}`);
}
assert(localesSrc.includes("isiXhosa") || localesSrc.includes("xh:"), "xhosa");
assert(localesSrc.includes("Tshivenda") || localesSrc.includes("ve:"), "venda");
assert(localesSrc.includes("Sepedi") || localesSrc.includes("nso:"), "sepedi");
ok(`Locales include SA + overseas languages (${LOCALES.length})`);

// 5. Safety modes keys
console.log("5) Safety modes");
const modesSrc = readFileSync(join(root, "src/context/SafetyModesContext.tsx"), "utf8");
for (const key of [
  "accessibilityMode",
  "lowDataMode",
  "batteryAwareMode",
  "silentPanicMode",
  "anonymousDefault",
]) {
  assert(modesSrc.includes(key), key);
}
ok("Accessibility, low-data, battery, silent, anonymous modes defined");

// 6. Silent panic wired
console.log("6) Silent panic + Help button");
const panicSrc = readFileSync(join(root, "src/app/(tabs)/panic.tsx"), "utf8");
const gritSrc = readFileSync(join(root, "src/components/GritHelpButton.tsx"), "utf8");
assert(panicSrc.includes("silentPanicMode"), "panic uses silent mode");
assert(gritSrc.includes("silent"), "GritHelpButton accepts silent");
ok("Silent panic alert mode wired");

// 7. Layout registers routes
console.log("7) Navigation registration");
const layout = readFileSync(join(root, "src/app/_layout.tsx"), "utf8");
for (const name of [
  "qr-scan",
  "chatbot",
  "offline-emergency",
  "safe-routes",
  "heatmap",
  "wearable-panic",
  "security-integration",
  "safety-settings",
]) {
  assert(layout.includes(`name="${name}"`), `route ${name}`);
}
ok("All feature routes registered");

// 8. Profile hosts features
console.log("8) Profile feature hub");
const profile = readFileSync(join(root, "src/app/(tabs)/profile.tsx"), "utf8");
assert(profile.includes("/qr-scan"), "profile → qr");
assert(profile.includes("/chatbot"), "profile → chatbot");
assert(profile.includes("/heatmap"), "profile → heatmap");
assert(profile.includes("useLocale"), "profile i18n");
ok("Profile links to new features");

// 9. Package deps
console.log("9) Dependencies");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
assert(pkg.dependencies["expo-camera"], "expo-camera");
assert(pkg.dependencies["expo-battery"], "expo-battery");
assert(pkg.dependencies["expo-localization"], "expo-localization");
ok("expo-camera, expo-battery, expo-localization installed");

// 10. Heatmap + safe routes + offline data presence
console.log("10) Feature data integrity");
const featureData = readFileSync(join(root, "src/data/featureData.ts"), "utf8");
assert(featureData.includes("HEATMAP_SPOTS"), "heatmap");
assert(featureData.includes("SAFE_ROUTES"), "safe routes");
assert(featureData.includes("OFFLINE_EMERGENCY"), "offline");
assert(featureData.includes("WEARABLE_CONCEPT"), "wearable");
assert(featureData.includes("SECURITY_INTEGRATION"), "security");
assert((featureData.match(/SB-QR-/g) || []).length >= 6, "≥6 QR codes");
ok("Heatmap, routes, offline, wearable, security data present");

console.log("\nAll safety feature tests passed.\n");
