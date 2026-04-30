import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import AppButton from "@/src/components/AppButton";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>👪</Text>
        </View>

        <Text style={styles.title}>Family Wallet</Text>

        <Text style={styles.subtitle}>
          Manage shared expenses together with your family, easily and transparently
        </Text>

        <AppButton
          title="Create Family Wallet"
          onPress={() => router.push("/(auth)/register")}
        />

        <AppButton
          title="Login"
          variant="outline"
          onPress={() => router.push("/(auth)/login")}
        />

        <AppButton
          title="Join via Code"
          variant="outline"
          onPress={() => router.push("/(auth)/join-with-invite")}
        />
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
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1FCB77",
    marginBottom: 20,
  },
  iconText: {
    fontSize: 34,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#3B4E6D",
    lineHeight: 28,
    marginBottom: 22,
  },
});