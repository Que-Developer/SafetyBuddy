import fs from "fs";

const path = "src/data/featureData.ts";
let s = fs.readFileSync(path, "utf8");

const newType = `export type ChatFaq = {
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
};`;

s = s.replace(/export type ChatFaq = \{[\s\S]*?\};/, newType);

const newFaqs = `export const CHATBOT_FAQS: ChatFaq[] = [
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
];`;

s = s.replace(/export const CHATBOT_FAQS: ChatFaq\[\] = \[[\s\S]*?\];/, newFaqs);

const newMatch = `export function matchChatbot(query: string): ChatFaq {
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
}`;

s = s.replace(/export function matchChatbot\([\s\S]*?\n\}/, newMatch);

fs.writeFileSync(path, s);
console.log("updated featureData");
