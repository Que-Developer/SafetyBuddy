import { ChatbotPanel } from "@/components/ChatbotPanel";
import { useTheme } from "@/context/ThemeContext";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Full-screen chatbot route — same panel as the floating bubble.
export default function ChatbotScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.bg }]}
      edges={["bottom"]}
    >
      <ChatbotPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
