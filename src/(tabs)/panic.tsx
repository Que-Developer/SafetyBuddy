import { StyleSheet, Text, View } from "react-native";

export default function Panic() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Panic-Button</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25292e"
  },
  text: {
    color: "#fff",
  },
});