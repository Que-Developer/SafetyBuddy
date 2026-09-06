import { StyleSheet, Text, View } from "react-native";

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Report</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffd24c"
  },
  text: {
    color: "#000458",
  },
});