# -*- coding: utf-8 -*-
"""Patch map.tsx to use useLocale / t() for Walk With Me UI strings."""
from pathlib import Path

path = Path(r"c:\Users\hp\source\repos\SafetyBuddy\src\app\(tabs)\map.tsx")
text = path.read_text(encoding="utf-8")

if "useLocale" not in text:
    text = text.replace(
        'import { useTheme } from "@/context/ThemeContext";\n',
        'import { useTheme } from "@/context/ThemeContext";\n'
        'import { useLocale } from "@/i18n/LocaleContext";\n',
    )

# Hook + fill helper after ACCENT
old_hook = '''export default function MapScreen() {
  const { colors } = useTheme();
  const ACCENT = colors.accent;
'''
new_hook = '''function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    template
  );
}

export default function MapScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const ACCENT = colors.accent;
'''
if old_hook in text and "function fill(" not in text:
    text = text.replace(old_hook, new_hook)

replacements = [
    (
        'const [endLabel, setEndLabel] = useState("Tap map for destination");',
        'const [endLabel, setEndLabel] = useState(() => t("tapMapForDestination"));',
    ),
    (
        'const [status, setStatus] = useState("Finding your live location at NMU…");',
        'const [status, setStatus] = useState(() => t("findingLiveLocation"));',
    ),
    (
        'const contact = contacts.find((c) => c.id === contactId)?.name ?? "trusted contacts";\n    setWalkActive(false);\n    setSimulating(false);\n    setStatus(`ETA missed — ${contact} alerted that you may be in danger`);\n    Alert.alert(\n      "Trusted contacts alerted",\n      `You did not confirm arrival within the estimated time. ${contact} and campus security have been informed that you may be in danger.`,\n      [{ text: "OK" }]\n    );',
        'const contact = contacts.find((c) => c.id === contactId)?.name ?? t("trustedContactsFallback");\n    setWalkActive(false);\n    setSimulating(false);\n    setStatus(fill(t("etaMissedAlertBody"), { contact }));\n    Alert.alert(\n      t("trustedContactsAlerted"),\n      fill(t("etaMissedAlertBody"), { contact }),\n      [{ text: t("ok") }]\n    );',
    ),
    (
        '''      setStatus(
        source === "on"
          ? "Live GPS at NMU — tap search to Walk with Me"
          : "Campus location (GPS unavailable) — tap search to Walk with Me"
      );''',
        '''      setStatus(
        source === "on" ? t("liveGpsWalkHint") : t("campusGpsWalkHint")
      );''',
    ),
    (
        '''        setStatus(
          gpsStatus === "on"
            ? "Live GPS at NMU — tap search to Walk with Me"
            : gpsStatus === "campus"
              ? "Campus location (GPS unavailable) — tap search to Walk with Me"
              : "Finding your live location at NMU…"
        );''',
        '''        setStatus(
          gpsStatus === "on"
            ? t("liveGpsWalkHint")
            : gpsStatus === "campus"
              ? t("campusGpsWalkHint")
              : t("findingLiveLocation")
        );''',
    ),
    (
        '''        if (walkActive) {
          setStatus("Route finished — tap I arrived safely before the timer ends");
        } else {
          setStatus("You arrived safely");
        }''',
        '''        if (walkActive) {
          setStatus(t("routeFinishedHint"));
        } else {
          setStatus(t("youArrivedSafely"));
        }''',
    ),
    (
        '''      Alert.alert(
        "Location needed",
        "Waiting for your live location at NMU. Try again in a moment."
      );''',
        '''      Alert.alert(t("locationNeeded"), t("locationNeededBody"));''',
    ),
    (
        '''      Alert.alert(
        "Location Error",
        "Waiting for your live location. Please try again."
      );''',
        '''      Alert.alert(t("locationError"), t("locationErrorBody"));''',
    ),
    (
        "setEndLabel(`Going to · ${pendingDestination.name}`);",
        'setEndLabel(fill(t("goingToLabel"), { place: pendingDestination.name }));',
    ),
    (
        '''    setStatus(
      `Walking with ${pendingContact.name} · ${formatDistance(meters)} · ETA ${etaMinutes} min`
    );''',
        '''    setStatus(
      fill(t("walkingWithStatus"), {
        name: pendingContact.name,
        distance: formatDistance(meters),
        eta: etaMinutes,
      })
    );''',
    ),
    (
        'const contact = selectedContact?.name ?? "trusted contacts";\n    setStatus(`Arrived safely — ${contact} notified`);\n    Alert.alert(\n      "You arrived safely",\n      `${contact} have been told you reached your destination.`\n    );',
        'const contact = selectedContact?.name ?? t("trustedContactsFallback");\n    setStatus(fill(t("arrivedSafelyStatus"), { contact }));\n    Alert.alert(\n      t("youArrivedSafely"),\n      fill(t("arrivedNotifiedBody"), { contact })\n    );',
    ),
    (
        'setStatus("Walk cancelled — tap search to start again");',
        'setStatus(t("walkCancelled"));',
    ),
    (
        '''  const gpsLabel =
    gpsStatus === "on"
      ? "Live GPS"
      : gpsStatus === "campus"
        ? "Campus pin"
        : gpsStatus === "off"
          ? "GPS off"
          : "Locating…";''',
        '''  const gpsLabel =
    gpsStatus === "on"
      ? t("liveGps")
      : gpsStatus === "campus"
        ? t("campusPin")
        : gpsStatus === "off"
          ? t("gpsOff")
          : t("locating");''',
    ),
    (
        '''                Alert.alert(
                  "Walk in progress",
                  "Cancel your current walk before choosing a new destination."
                );''',
        '''                Alert.alert(t("walkInProgress"), t("walkInProgressBody"));''',
    ),
]

for old, new in replacements:
    if old not in text:
        print("MISSING:", old[:80].replace("\n", " "))
    else:
        text = text.replace(old, new)
        print("ok:", old[:60].replace("\n", " "))

# JSX string replacements
jsx = [
    ('Walk with {selectedContact?.name ?? "buddy"}', '{fill(t("walkWithEllipsis"), {})} {selectedContact?.name ?? "buddy"}'),
    # fix walk title properly below
]
# Manual JSX patches via unique snippets
jsx_patches = [
    (
        '''                <Text style={[styles.walkTitle, { color: colors.text }]}>
                  Walk with {selectedContact?.name ?? "buddy"}
                </Text>''',
        '''                <Text style={[styles.walkTitle, { color: colors.text }]}>
                  {t("walkWithMe")} · {selectedContact?.name ?? "buddy"}
                </Text>''',
    ),
    (
        '''                <Text style={[styles.etaBadgeLabel, { color: colors.bg }]}>
                  ETA
                </Text>''',
        '''                <Text style={[styles.etaBadgeLabel, { color: colors.bg }]}>
                  {t("eta")}
                </Text>''',
    ),
    (
        '''            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {Math.round(progress * 100)}% along route · {eta} min estimate
            </Text>''',
        '''            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {fill(t("walkProgressLabel"), {
                pct: Math.round(progress * 100),
                eta,
              })}
            </Text>''',
    ),
    (
        '''                <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>''',
        '''                <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t("cancel")}</Text>''',
    ),
    (
        '''                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  I arrived safely
                </Text>''',
        '''                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  {t("iArrivedSafely")}
                </Text>''',
    ),
    (
        '''              <Text style={[styles.modalTitle, { color: colors.text }]}>Where to?</Text>''',
        '''              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("whereTo")}</Text>''',
    ),
    (
        '''              placeholder="Search NMU destinations…"''',
        '''              placeholder={t("searchDestinations")}''',
    ),
    (
        '''              <Text style={[styles.modalTitle, { color: colors.text }]}>Walk with…</Text>''',
        '''              <Text style={[styles.modalTitle, { color: colors.text }]}>{t("walkWithEllipsis")}</Text>''',
    ),
    (
        '''            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              Choose a trusted contact to share your live walk to{" "}
              {pendingDestination?.name ?? "your destination"}.
            </Text>''',
        '''            <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
              {fill(t("chooseTrustedContact"), {
                place: pendingDestination?.name ?? t("yourDestination"),
              })}
            </Text>''',
    ),
    (
        '''            <Text style={[styles.modalTitle, { color: colors.text }]}>Start Walk with Me?</Text>''',
        '''            <Text style={[styles.modalTitle, { color: colors.text }]}>{t("startWalkConfirm")}</Text>''',
    ),
    (
        '''                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>From</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>
                  My live location
                </Text>''',
        '''                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>{t("from")}</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>
                  {t("myLiveLocation")}
                </Text>''',
    ),
    (
        '''                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>To</Text>''',
        '''                <Text style={[styles.confirmLabel, { color: colors.textMuted }]}>{t("to")}</Text>''',
    ),
    (
        '''                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Distance</Text>''',
        '''                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("distance")}</Text>''',
    ),
    (
        '''                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Walking ETA</Text>''',
        '''                <Text style={[styles.statLabel, { color: colors.textMuted }]}>{t("walkingEta")}</Text>''',
    ),
    (
        '''                <Text style={[styles.cancelBtnText, { color: colors.text }]}>Back</Text>''',
        '''                <Text style={[styles.cancelBtnText, { color: colors.text }]}>{t("back")}</Text>''',
    ),
    (
        '''                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  Start walk
                </Text>''',
        '''                <Text style={[styles.arriveBtnText, { color: colors.bg }]}>
                  {t("startWalk")}
                </Text>''',
    ),
]

for old, new in jsx_patches:
    if old not in text:
        print("JSX MISSING:", old[:90].replace("\n", " "))
    else:
        text = text.replace(old, new)
        print("jsx ok")

# CampusMap youLabel prop
if "youLabel=" not in text:
    text = text.replace(
        """        <CampusMap
          mode={mode}
          base={base}
          activeLayers={activeLayers}
          pickMode={pickMode}
          start={start}
          end={end}
          simulating={simulating}
          liveLocation={live}
          followLive={followLive && !simulating}
          onEvent={onMapEvent}
        />""",
        """        <CampusMap
          mode={mode}
          base={base}
          activeLayers={activeLayers}
          pickMode={pickMode}
          start={start}
          end={end}
          simulating={simulating}
          liveLocation={live}
          followLive={followLive && !simulating}
          youLabel={t("youMarker")}
          onEvent={onMapEvent}
        />""",
    )
    print("youLabel ok")

# Fix dependency arrays that need t
text = text.replace(
    "  }, [walkActive, secondsLeft, contacts, contactId]);",
    "  }, [walkActive, secondsLeft, contacts, contactId, t]);",
)
text = text.replace(
    "    [walkActive, gpsStatus]\n  );",
    "    [walkActive, gpsStatus, t]\n  );",
)

path.write_text(text, encoding="utf-8")
print("wrote map.tsx")
