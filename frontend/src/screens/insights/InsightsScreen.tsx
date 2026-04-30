import { View, Text, StyleSheet } from "react-native";

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights & Alerts</Text>
      <Text style={styles.subtitle}>Smart suggestions will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#102E59",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#4B5563",
  },
});