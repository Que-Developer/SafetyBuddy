import fs from "fs";

const path = "src/i18n/locales.ts";
let s = fs.readFileSync(path, "utf8");

const extraEn = `
  menuTitle: "Quick navigation",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  tipHelp: "Tips",
  tipHome: "Home dashboard — SOS, alerts, and quick safety actions.",
  tipMap: "Map — start Walk With Me and view safe campus layers.",
  tipPanic: "Panic — countdown sends help. Tap the button to cancel.",
  tipReports: "Reports — share anonymous or named safety concerns.",
  tipProfile: "Profile — language, contacts, modes, and logout.",
  tipGeneric: "Use the menu for features, support, or logout anytime.",
  navQuickLinks: "Features & account",
  sendMessage: "Send",
  chatWelcome:
    "Hi — I'm SafetyBuddy's safety guide. I answer from approved campus content and follow your app language.",
  chatApprovedTopic: "Approved topic",
  chatFaq1Q: "What should I do in an emergency?",
  chatFaq1A:
    "Move to a lit public area if you can. Use Panic/Help to alert campus security and trusted contacts with your location. You can also dial Campus Security from Call for Help.",
  chatFaq2Q: "How does Walk With Me work?",
  chatFaq2A:
    "Open the Map tab, choose start and end points, pick a trusted contact, and start the journey timer. Prefer well-lit safe routes.",
  chatFaq3Q: "Can I report anonymously?",
  chatFaq3A:
    "Yes. On Reports, keep Submit anonymously on. Your name is not attached.",
  chatFaq4Q: "How do I contact campus security?",
  chatFaq4A:
    "Use Call for Help or Offline Emergency for Campus Security (+27 41 504 2000).",
  chatFaq5Q: "Where can I get counselling support?",
  chatFaq5A:
    "Student Counselling: +27 41 504 2511. Crisis line SADAG: 0800 567 567.",
  chatFaq6Q: "What are QR checkpoints?",
  chatFaq6A:
    "Campus QR posters confirm a known safe point and show local tips plus nearest help.",
  chatFaq7Q: "What is silent panic mode?",
  chatFaq7A:
    "In Profile safety modes, silent panic reduces haptics and glow while still notifying security.",
  chatFaq8Q: "Does SafetyBuddy work offline?",
  chatFaq8A:
    "Offline Emergency stores key numbers on your device. Live Help alerts still need a network.",
  openChat: "Open safety chatbot",
  closeChat: "Close chatbot",
  chatFollowsAppLanguage: "Chat language matches your app language setting.",
`;

if (!s.includes("menuTitle:")) {
  s = s.replace(
    /accountStoredNote:\s*"[^"]*",/,
    (m) => m + extraEn
  );
}

const overlays = {
  xh: `
    menuTitle: "Ukukhangela okukhawulezayo",
    openMenu: "Vula imenyu",
    tipHome: "Ideshibhodi yekhaya — SOS, izaziso, neentshukumo zokhuseleko.",
    tipPanic: "Panic — ukubala kuthumela uncedo. Cofa iqhosha ukurhoxisa.",
    tipProfile: "Iprofayile — ulwimi, abantu, iimowudi, nokuphuma.",
    chatWelcome: "Molo — ndiyisikhokelo sokhuseleko se-SafetyBuddy. Ndilandelela ulwimi lwe-app yakho.",
    openChat: "Vula incoko yokhuseleko",
    closeChat: "Vala incoko",
    chatFollowsAppLanguage: "Ulwimi lwe-chat luhambelana nolwimi lwe-app.",
    chatFaq1Q: "Ndenza ntoni xa kungxamisekile?",
    sendMessage: "Thumela",
  `,
  af: `
    menuTitle: "Vinnige navigasie",
    openMenu: "Maak kieslys oop",
    tipHome: "Tuis-kontroleskerm — SOS, waarskuwings en vinnige aksies.",
    tipPanic: "Paniek — aftelling stuur hulp. Tik die knoppie om te kanselleer.",
    tipProfile: "Profiel — taal, kontakte, modes en teken uit.",
    chatWelcome: "Hallo — ek is SafetyBuddy se veiligheidsgids. Ek volg jou app-taal.",
    openChat: "Maak veiligheids-kletsbot oop",
    closeChat: "Maak kletsbot toe",
    chatFollowsAppLanguage: "Klets-taal pas by jou app-taal.",
    chatFaq1Q: "Wat doen ek in 'n noodgeval?",
    sendMessage: "Stuur",
  `,
  fr: `
    menuTitle: "Navigation rapide",
    openMenu: "Ouvrir le menu",
    tipHome: "Accueil — SOS, alertes et actions rapides.",
    tipPanic: "Panique — le compte à rebours envoie de l'aide. Appuyez pour annuler.",
    tipProfile: "Profil — langue, contacts, modes et déconnexion.",
    chatWelcome: "Bonjour — je suis le guide sécurité de SafetyBuddy. Je suis la langue de l'app.",
    openChat: "Ouvrir le chatbot",
    closeChat: "Fermer le chatbot",
    chatFollowsAppLanguage: "La langue du chat suit la langue de l'app.",
    chatFaq1Q: "Que faire en cas d'urgence ?",
    sendMessage: "Envoyer",
  `,
  es: `
    menuTitle: "Navegación rápida",
    openMenu: "Abrir menú",
    tipHome: "Inicio — SOS, alertas y acciones rápidas.",
    tipPanic: "Pánico — la cuenta regresiva envía ayuda. Toca para cancelar.",
    tipProfile: "Perfil — idioma, contactos, modos y cerrar sesión.",
    chatWelcome: "Hola — soy la guía de seguridad de SafetyBuddy. Sigo el idioma de la app.",
    openChat: "Abrir chatbot",
    closeChat: "Cerrar chatbot",
    chatFollowsAppLanguage: "El idioma del chat sigue el idioma de la app.",
    chatFaq1Q: "¿Qué hago en una emergencia?",
    sendMessage: "Enviar",
  `,
  zh: `
    menuTitle: "快捷导航",
    openMenu: "打开菜单",
    tipHome: "首页 — SOS、警报与快捷安全操作。",
    tipPanic: "紧急 — 倒计时发送求助。点按按钮可取消。",
    tipProfile: "我的 — 语言、联系人、模式与退出。",
    chatWelcome: "你好 — 我是 SafetyBuddy 安全助手，会跟随应用语言。",
    openChat: "打开安全聊天",
    closeChat: "关闭聊天",
    chatFollowsAppLanguage: "聊天语言与应用语言一致。",
    chatFaq1Q: "紧急情况该怎么办？",
    sendMessage: "发送",
  `,
};

for (const [code, partial] of Object.entries(overlays)) {
  const marker = `${code}: o({`;
  if (s.includes(marker) && !s.includes(`${code}: o({`) === false) {
    // insert after opening of overlay if menuTitle not already there for that block
  }
  if (!s.includes(`menuTitle:`) || true) {
    // Insert partial right after `${code}: o({`
    if (s.includes(`${code}: o({`) && !new RegExp(`${code}: o\\(\\{[\\s\\S]*?menuTitle:`).test(s.split(`${code}: o({`)[1]?.slice(0, 800) || "")) {
      s = s.replace(`${code}: o({`, `${code}: o({${partial}`);
    }
  }
}

fs.writeFileSync(path, s);
console.log("locales patched");
