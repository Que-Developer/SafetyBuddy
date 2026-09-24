import { useTheme } from "@/context/ThemeContext";
import { CHATBOT_FAQS, matchChatbot } from "@/data/featureData";
import { useLocale } from "@/i18n/LocaleContext";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Msg = { id: string; role: "user" | "bot"; text: string };

type Props = {
  compact?: boolean;
};

// FAQ chatbot UI — matches questions to approved campus safety topics.
export function ChatbotPanel({ compact = false }: Props) {
  const { colors } = useTheme();
  const { t, locale } = useLocale();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);

  useEffect(() => {
    // Reset the welcome message when the app language changes.
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: `${t("chatWelcome")}\n\n${t("chatFollowsAppLanguage")}`,
      },
    ]);
  }, [locale, t]);

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    // Pick the closest FAQ entry, then show the translated answer.
    const faq = matchChatbot(q);
    const question = t(faq.questionKey);
    const answer = t(faq.answerKey);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: q },
      {
        id: `b-${Date.now()}`,
        role: "bot",
        text: `${answer}\n\n(${t("chatApprovedTopic")}: ${question})`,
      },
    ]);
    setInput("");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={compact ? 24 : 80}
    >
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubble,
              item.role === "user"
                ? { backgroundColor: colors.navy, alignSelf: "flex-end" }
                : { backgroundColor: colors.card, alignSelf: "flex-start" },
            ]}
          >
            <Text
              style={{
                color: item.role === "user" ? colors.bg : colors.text,
                lineHeight: 20,
                fontSize: 14,
              }}
            >
              {item.text}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.suggestions}>
            {/* Quick chips so people don't have to type common questions. */}
            {CHATBOT_FAQS.slice(0, 4).map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.chip, { borderColor: colors.navy }]}
                onPress={() => send(t(f.questionKey))}
              >
                <Text
                  style={{
                    color: colors.navy,
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {t(f.questionKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        }
      />
      <View style={[styles.composer, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={t("askAnything")}
          placeholderTextColor={colors.textDim}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => send(input)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.send, { backgroundColor: colors.navy }]}
          onPress={() => send(input)}
          accessibilityLabel={t("sendMessage")}
        >
          <Ionicons name="send" size={18} color={colors.bg} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 8, gap: 8 },
  bubble: {
    maxWidth: "90%",
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
  },
  suggestions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: "100%",
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    gap: 8,
    margin: 8,
    borderRadius: 14,
  },
  input: { flex: 1, paddingVertical: 8, paddingHorizontal: 8, fontSize: 15 },
  send: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
