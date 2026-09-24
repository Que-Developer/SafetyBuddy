# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TYPES = ROOT / "src" / "i18n" / "types.ts"
LOCALES = ROOT / "src" / "i18n" / "locales.ts"

NEW_KEYS = [
    "cancel",
    "back",
    "ok",
    "continue",
    "eta",
    "from",
    "to",
    "distance",
    "walkingEta",
    "whereTo",
    "searchDestinations",
    "walkWithEllipsis",
    "chooseTrustedContact",
    "startWalkConfirm",
    "myLiveLocation",
    "startWalk",
    "iArrivedSafely",
    "walkInProgress",
    "walkInProgressBody",
    "tapMapForDestination",
    "findingLiveLocation",
    "liveGpsWalkHint",
    "campusGpsWalkHint",
    "locationNeeded",
    "locationNeededBody",
    "locationError",
    "locationErrorBody",
    "youArrivedSafely",
    "arrivedNotifiedBody",
    "trustedContactsAlerted",
    "etaMissedAlertBody",
    "walkCancelled",
    "walkProgressLabel",
    "walkingWithStatus",
    "goingToLabel",
    "arrivedSafelyStatus",
    "routeFinishedHint",
    "liveGps",
    "campusPin",
    "gpsOff",
    "locating",
    "youMarker",
    "splashTagline",
    "themeSelectHeader",
    "themePersonalization",
    "themeSelectBetween",
    "themeSelectSubtitle",
    "themeYellowTitle",
    "themeYellowBody",
    "themeDarkTitle",
    "themeDarkBody",
    "rememberMe",
    "forgotPassword",
    "showPassword",
    "hidePassword",
    "lightThemeA11y",
    "responderDashboard",
    "adminManager",
    "demoRole",
    "callNow",
    "stepsTab",
    "privacyNoticeTitle",
    "privacyIntro",
    "privacyReliabilityTitle",
    "privacyReliabilityBody",
    "privacySecurityTitle",
    "privacySecurityBody",
    "allowCameraQr",
    "qrIntro",
    "safeRoutesIntro",
    "resourcesIntro",
    "offlineEmergencyNote",
    "heatmapAdminBanner",
    "yourDestination",
    "trustedContactsFallback",
]

EN_VALUES = {
    "cancel": "Cancel",
    "back": "Back",
    "ok": "OK",
    "continue": "Continue",
    "eta": "ETA",
    "from": "From",
    "to": "To",
    "distance": "Distance",
    "walkingEta": "Walking ETA",
    "whereTo": "Where to?",
    "searchDestinations": "Search NMU destinations…",
    "walkWithEllipsis": "Walk with…",
    "chooseTrustedContact": "Choose a trusted contact to share your live walk to {place}.",
    "startWalkConfirm": "Start Walk with Me?",
    "myLiveLocation": "My live location",
    "startWalk": "Start walk",
    "iArrivedSafely": "I arrived safely",
    "walkInProgress": "Walk in progress",
    "walkInProgressBody": "Cancel your current walk before choosing a new destination.",
    "tapMapForDestination": "Tap map for destination",
    "findingLiveLocation": "Finding your live location at NMU…",
    "liveGpsWalkHint": "Live GPS at NMU — tap search to Walk with Me",
    "campusGpsWalkHint": "Campus location (GPS unavailable) — tap search to Walk with Me",
    "locationNeeded": "Location needed",
    "locationNeededBody": "Waiting for your live location at NMU. Try again in a moment.",
    "locationError": "Location Error",
    "locationErrorBody": "Waiting for your live location. Please try again.",
    "youArrivedSafely": "You arrived safely",
    "arrivedNotifiedBody": "{contact} have been told you reached your destination.",
    "trustedContactsAlerted": "Trusted contacts alerted",
    "etaMissedAlertBody": "You did not confirm arrival within the estimated time. {contact} and campus security have been informed that you may be in danger.",
    "walkCancelled": "Walk cancelled — tap search to start again",
    "walkProgressLabel": "{pct}% along route · {eta} min estimate",
    "walkingWithStatus": "Walking with {name} · {distance} · ETA {eta} min",
    "goingToLabel": "Going to · {place}",
    "arrivedSafelyStatus": "Arrived safely — {contact} notified",
    "routeFinishedHint": "Route finished — tap I arrived safely before the timer ends",
    "liveGps": "Live GPS",
    "campusPin": "Campus pin",
    "gpsOff": "GPS off",
    "locating": "Locating…",
    "youMarker": "You",
    "splashTagline": "Protecting Your Academic Journey",
    "themeSelectHeader": "THEME",
    "themePersonalization": "Personalization",
    "themeSelectBetween": "Select between the two",
    "themeSelectSubtitle": "Personalize your workspace. High-contrast elements are optimized for accessibility and focus.",
    "themeYellowTitle": "Standard Yellow",
    "themeYellowBody": "High-contrast golden accents on a warm foundation. Best for clarity in daylight.",
    "themeDarkTitle": "Dark Mode",
    "themeDarkBody": "Deep navy foundations with yellow highlights. Ideal for low-light environments.",
    "rememberMe": "Remember Me",
    "forgotPassword": "Forgot Password?",
    "showPassword": "Show password",
    "hidePassword": "Hide password",
    "lightThemeA11y": "Light yellow theme",
    "responderDashboard": "Responder dashboard",
    "adminManager": "Admin Manager",
    "demoRole": "Demo Role",
    "callNow": "CALL NOW",
    "stepsTab": "STEPS",
    "privacyNoticeTitle": "Privacy notice",
    "privacyIntro": "SafetyBuddy is built for dignity and privacy. Below is how a production deployment would handle your information under POPIA-aligned principles.",
    "privacyReliabilityTitle": "Reliability & edge cases",
    "privacyReliabilityBody": "If you have no data, emergency numbers remain available for voice calls. If GPS is unavailable, the last known or selected campus zone is used. If an alert fails to send, the app shows a retry path and still offers one-tap calling. Low battery: keep Help and Call Security on the first screen. Accidental alerts: hold-to-activate plus a cancel window before dispatch.",
    "privacySecurityTitle": "Security (production)",
    "privacySecurityBody": "Official university authentication, encrypted communication, secure storage, audit logs, and restricted access to sensitive emergency records would be required before live student use.",
    "allowCameraQr": "Allow camera to scan QR",
    "qrIntro": "Scan campus QR posters to confirm a safe checkpoint and see nearby tips.",
    "safeRoutesIntro": "Suggested well-lit campus paths. Prefer routes with more lighting when walking alone.",
    "resourcesIntro": "Quick links to campus safety information and support.",
    "offlineEmergencyNote": "— numbers & steps saved on this device",
    "heatmapAdminBanner": "Admin / security view — aggregated concern density only. No individual identities.",
    "yourDestination": "your destination",
    "trustedContactsFallback": "trusted contacts",
}

# Extra overrides for a few locales (map + chrome that testers hit first)
OVERRIDES = {
    "xh": {
        "cancel": "Rhoxisa",
        "back": "Buyela",
        "ok": "Kulungile",
        "continue": "Qhubeka",
        "eta": "IXA",
        "from": "Ukusuka",
        "to": "Ukuya",
        "distance": "Umgama",
        "walkingEta": "IXA lokuhamba",
        "whereTo": "Uya phi?",
        "searchDestinations": "Khangela iindawo ze-NMU…",
        "walkWithEllipsis": "Hamba no…",
        "startWalk": "Qala uhambo",
        "iArrivedSafely": "Ndifike ndikhuselekile",
        "walkInProgress": "Uhambo luyaqhubeka",
        "liveGps": "GPS ephilayo",
        "campusPin": "Iphin yekhampasi",
        "gpsOff": "GPS icimile",
        "locating": "Iyafumana…",
        "youMarker": "Wena",
        "rememberMe": "Ndikhumbule",
        "forgotPassword": "Ulibele igama lokugqithisa?",
        "splashTagline": "Ukukhusela uhambo lwakho lwezemfundo",
        "responderDashboard": "Ideshibhodi yabaphenduli",
        "adminManager": "Umlawuli",
        "callNow": "TSHAYA NGOKU",
        "stepsTab": "AMANYATHELO",
        "privacyNoticeTitle": "Isaziso sabucala",
    },
    "af": {
        "cancel": "Kanselleer",
        "back": "Terug",
        "ok": "OK",
        "continue": "Gaan voort",
        "eta": "ETA",
        "from": "Van",
        "to": "Na",
        "distance": "Afstand",
        "walkingEta": "Stap-ETA",
        "whereTo": "Waarheen?",
        "searchDestinations": "Soek NMU-bestemmings…",
        "walkWithEllipsis": "Stap saam met…",
        "startWalk": "Begin stap",
        "iArrivedSafely": "Ek het veilig aangekom",
        "walkInProgress": "Stap aan die gang",
        "liveGps": "Lewendige GPS",
        "campusPin": "Kampusspeld",
        "gpsOff": "GPS af",
        "locating": "Soek…",
        "youMarker": "Jy",
        "rememberMe": "Onthou my",
        "forgotPassword": "Wagwoord vergeet?",
        "splashTagline": "Beskerm jou akademiese reis",
        "responderDashboard": "Respondeerder-kontroleskerm",
        "adminManager": "Adminbestuurder",
        "callNow": "BEL NOU",
        "stepsTab": "STAPPE",
        "privacyNoticeTitle": "Privaatheidskennisgewing",
    },
    "fr": {
        "cancel": "Annuler",
        "back": "Retour",
        "ok": "OK",
        "continue": "Continuer",
        "eta": "ETA",
        "from": "De",
        "to": "À",
        "distance": "Distance",
        "walkingEta": "ETA à pied",
        "whereTo": "Où aller ?",
        "searchDestinations": "Rechercher des destinations NMU…",
        "walkWithEllipsis": "Marcher avec…",
        "startWalk": "Démarrer",
        "iArrivedSafely": "Je suis arrivé(e) en sécurité",
        "walkInProgress": "Marche en cours",
        "liveGps": "GPS en direct",
        "campusPin": "Point campus",
        "gpsOff": "GPS off",
        "locating": "Localisation…",
        "youMarker": "Vous",
        "rememberMe": "Se souvenir de moi",
        "forgotPassword": "Mot de passe oublié ?",
        "splashTagline": "Protéger votre parcours académique",
        "responderDashboard": "Tableau répondeur",
        "adminManager": "Gestion admin",
        "callNow": "APPELER",
        "stepsTab": "ÉTAPES",
        "privacyNoticeTitle": "Avis de confidentialité",
    },
    "es": {
        "cancel": "Cancelar",
        "back": "Atrás",
        "ok": "OK",
        "continue": "Continuar",
        "eta": "ETA",
        "from": "Desde",
        "to": "Hasta",
        "distance": "Distancia",
        "walkingEta": "ETA a pie",
        "whereTo": "¿A dónde?",
        "searchDestinations": "Buscar destinos NMU…",
        "walkWithEllipsis": "Caminar con…",
        "startWalk": "Empezar",
        "iArrivedSafely": "Llegué a salvo",
        "walkInProgress": "Caminata en curso",
        "liveGps": "GPS en vivo",
        "campusPin": "Pin del campus",
        "gpsOff": "GPS apagado",
        "locating": "Localizando…",
        "youMarker": "Tú",
        "rememberMe": "Recuérdame",
        "forgotPassword": "¿Olvidaste la contraseña?",
        "splashTagline": "Protegiendo tu trayectoria académica",
        "responderDashboard": "Panel del respondedor",
        "adminManager": "Administración",
        "callNow": "LLAMAR",
        "stepsTab": "PASOS",
        "privacyNoticeTitle": "Aviso de privacidad",
    },
    "ar": {
        "cancel": "إلغاء",
        "back": "رجوع",
        "ok": "حسناً",
        "continue": "متابعة",
        "eta": "الوصول",
        "from": "من",
        "to": "إلى",
        "distance": "المسافة",
        "walkingEta": "وقت المشي",
        "whereTo": "إلى أين؟",
        "searchDestinations": "ابحث عن وجهات الجامعة…",
        "walkWithEllipsis": "امشِ مع…",
        "startWalk": "ابدأ المشي",
        "iArrivedSafely": "وصلت بأمان",
        "walkInProgress": "المشي جارٍ",
        "liveGps": "GPS مباشر",
        "campusPin": "موقع الحرم",
        "gpsOff": "GPS متوقف",
        "locating": "جارٍ التحديد…",
        "youMarker": "أنت",
        "rememberMe": "تذكرني",
        "forgotPassword": "نسيت كلمة المرور؟",
        "splashTagline": "حماية رحلتك الأكاديمية",
        "responderDashboard": "لوحة المستجيب",
        "adminManager": "إدارة النظام",
        "callNow": "اتصل الآن",
        "stepsTab": "الخطوات",
        "privacyNoticeTitle": "إشعار الخصوصية",
    },
}


def patch_types():
    text = TYPES.read_text(encoding="utf-8")
    needle = '  | "a11yDisabilityBody";'
    if needle not in text:
        raise SystemExit("types needle missing")
    lines = "\n".join(f'  | "{k}"' for k in NEW_KEYS)
    text = text.replace(needle, f'  | "a11yDisabilityBody"\n{lines};')
    TYPES.write_text(text, encoding="utf-8")
    print("patched types.ts")


def patch_locales():
    text = LOCALES.read_text(encoding="utf-8")
    needle = '  a11yDisabilityBody:\n    "Screen-reader labels, large hit targets, reduced motion options, and offline help for all students.",\n};'
    if needle not in text:
        # try single-line form
        needle2 = '  a11yDisabilityBody:\n    "Screen-reader labels, large hit targets, reduced motion options, and offline help for all students.",\n};'
        if needle2 not in text:
            raise SystemExit("locales en closing needle missing")
        needle = needle2

    en_lines = []
    for k in NEW_KEYS:
        v = EN_VALUES[k].replace("\\", "\\\\").replace('"', '\\"')
        en_lines.append(f'  {k}: "{v}",')
    insert = "\n".join(en_lines)
    replacement = (
        '  a11yDisabilityBody:\n'
        '    "Screen-reader labels, large hit targets, reduced motion options, and offline help for all students.",\n'
        f"{insert}\n"
        "};"
    )
    text = text.replace(needle, replacement)

    # Inject overrides into each locale's o({...}) block — before closing `}),`
    for code, overs in OVERRIDES.items():
        marker = f"  {code}: o({{"
        idx = text.find(marker)
        if idx < 0:
            print("skip missing locale", code)
            continue
        # find end of this o({ ... }),
        start = idx + len(marker)
        # Find matching closing `}),` at locale level — look for `\n  }),\n` after start
        end = text.find("\n  }),\n", start)
        if end < 0:
            end = text.find("\n  }),\r\n", start)
        if end < 0:
            print("skip end not found", code)
            continue
        block = text[start:end]
        extra = []
        for k, v in overs.items():
            if f"{k}:" in block:
                continue
            vv = v.replace("\\", "\\\\").replace('"', '\\"')
            extra.append(f'    {k}: "{vv}",')
        if not extra:
            continue
        text = text[:end] + "\n" + "\n".join(extra) + text[end:]
        print("patched overrides", code, len(extra))

    LOCALES.write_text(text, encoding="utf-8")
    print("patched locales.ts")


if __name__ == "__main__":
    patch_types()
    patch_locales()
