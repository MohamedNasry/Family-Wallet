import React from "react";
import { View, Text, StyleSheet, Alert, Share, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import AppButton from "../../components/AppButton";

export default function FamilyCodeScreen() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  const code = typeof inviteCode === "string" ? inviteCode : "";

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied", "Family code copied successfully");
  };

  const handleShare = async () => {
    await Share.share({
      message: `Join my family wallet using this invite code: ${code}`,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>👪</Text>
        </View>

        <Text style={styles.title}>Your Family Code</Text>
        <Text style={styles.subtitle}>Share this code with family members</Text>

        <View style={styles.codeBox}>
          <Text style={styles.code}>{code || "NO-CODE"}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.smallButton} onPress={handleCopy}>
              <Text style={styles.smallButtonText}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallButton} onPress={handleShare}>
              <Text style={styles.smallButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <AppButton title="Get Started" onPress={() => router.replace("/(tabs)" as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "#F7F7F7",
    borderRadius: 28,
    padding: 28,
  },
  iconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#D8F2E0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#475A78",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 22,
  },
  codeBox: {
    backgroundColor: "#E8F3EE",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  code: {
    fontSize: 34,
    fontWeight: "400",
    color: "#12325E",
    textAlign: "center",
    marginVertical: 18,
    letterSpacing: 2,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 14,
  },
  smallButton: {
    flex: 1,
    backgroundColor: "#F7F7F7",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  smallButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3B4E6D",
  },
});