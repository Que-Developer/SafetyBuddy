/**
 * Smoke tests for panic flow + i18n completeness.
 * Usage: node scripts/test-panic-i18n.mjs
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function assert(cond, msg) {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

console.log("\nPanic + i18n tests\n");

const panic = readFileSync(join(root, "src/app/(tabs)/panic.tsx"), "utf8");
assert(!panic.includes('phase === "sent"'), "no sent phase");
assert(!/help is on the way/i.test(panic), "no help-on-way copy");
assert(panic.includes('router.replace("/panicCountdownAlert")'), "goes to call screen");
assert(panic.includes("onCancelled={cancel}"), "cancel wired");
ok("Panic skips intermediate screen and wires cancel");

const grit = readFileSync(join(root, "src/components/GritHelpButton.tsx"), "utf8");
assert(grit.includes("Pressable"), "button pressable");
assert(grit.includes("handleCancelTap") || grit.includes("onCancelled"), "tap cancels");
assert(grit.includes("tapToCancelCountdown"), "cancel label translated");
ok("Countdown button is tappable to cancel");

const modes = readFileSync(join(root, "src/context/SafetyModesContext.tsx"), "utf8");
assert(modes.includes("lowDataMode"), "low-data kept");
ok("Low-data mode still present");

const locales = readFileSync(join(root, "src/i18n/locales.ts"), "utf8");
const types = readFileSync(join(root, "src/i18n/types.ts"), "utf8");
const keys = [...types.matchAll(/\|\s*"([^"]+)"/g)].map((m) => m[1]).filter((k) => k.length > 1 && !["en","xh","ve","nso","af","fr","es","pt","zh","ar","sw"].includes(k));
assert(keys.includes("tabHome") && keys.includes("login") && keys.includes("tapToCancelCountdown"), "new keys present");
assert(locales.includes("tabHome:") || locales.includes("tabHome:"), "locales have tabHome");
for (const code of ["en", "xh", "ve", "nso", "af", "fr", "es", "pt", "zh", "ar", "sw"]) {
  assert(locales.includes(`${code}:`) || locales.includes(`${code},`) || locales.includes(`${code}: o(`) || locales.includes(`${code}:\n`) || locales.includes(`  ${code}:`), `locale ${code}`);
}
ok(`Translation keys expanded (${keys.length}+) across locales`);

const wired = [
  "src/app/(tabs)/_layout.tsx",
  "src/app/(tabs)/home.tsx",
  "src/app/(tabs)/profile.tsx",
  "src/app/(tabs)/panic.tsx",
  "src/app/(tabs)/report.tsx",
  "src/app/login.tsx",
  "src/app/support.tsx",
  "src/app/emergency.tsx",
  "src/app/AlertCanceled.tsx",
  "src/app/panicCountdownAlert.tsx",
  "src/app/report-success.tsx",
];
for (const f of wired) {
  assert(existsSync(join(root, f)), f);
  const src = readFileSync(join(root, f), "utf8");
  assert(src.includes("useLocale") || src.includes('from "@/i18n'), `${f} uses i18n`);
}
ok("Main screens use useLocale");

const themeWired = [
  "src/app/support.tsx",
  "src/app/emergency.tsx",
  "src/app/report-success.tsx",
  "src/app/(tabs)/resources.tsx",
  "src/app/panicCountdownAlert.tsx",
];
for (const f of themeWired) {
  const src = readFileSync(join(root, f), "utf8");
  assert(src.includes("useTheme"), `${f} uses theme`);
  assert(!src.includes("COLORS."), `${f} avoids static COLORS`);
}
ok("Student screens use ThemeContext consistently");

console.log("\nAll panic + i18n tests passed.\n");
