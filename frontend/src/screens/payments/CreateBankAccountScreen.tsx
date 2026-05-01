import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { createBankAccountApi } from "../../api/mockBank.api";

const showMessage = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function CreateBankAccountScreen() {
  const [bankName, setBankName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    try {
      const parsedBalance = Number(balance);

      if (!bankName.trim()) {
        showMessage("Validation", "Bank name is required");
        return;
      }

      if (!cardNumber.trim()) {
        showMessage("Validation", "Card number is required");
        return;
      }

      if (
        parsedBalance < 0 ||
        Number.isNaN(parsedBalance) ||
        balance.trim() === ""
      ) {
        showMessage("Validation", "Balance must be valid");
        return;
      }

      setCreating(true);

      await createBankAccountApi({
        bankName: bankName.trim(),
        cardNumber: cardNumber.trim(),
        balance: parsedBalance,
        isDefault,
      });

      showMessage("Success", "Bank account created successfully");

      router.replace("/bank-accounts" as any);
    } catch (error: any) {
      showMessage("Error", error.message || "Failed to create bank account");
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={["#10C95C", "#2F80ED"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Create Bank Account</Text>
          <Text style={styles.headerSubtitle}>Add a mock account for testing</Text>
        </LinearGradient>

        <View style={styles.formCard}>
          <View style={styles.iconBox}>
            <Ionicons name="card-outline" size={34} color="#08C742" />
          </View>

          <Text style={styles.formTitle}>Account Details</Text>

          <Text style={styles.label}>Bank Name</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Example: CIH Bank"
            placeholderTextColor="#98A2B3"
          />

          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="Example: 4242 4242 4242 4242"
            placeholderTextColor="#98A2B3"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Initial Balance</Text>
          <TextInput
            style={styles.input}
            value={balance}
            onChangeText={setBalance}
            placeholder="Example: 1000"
            placeholderTextColor="#98A2B3"
            keyboardType="decimal-pad"
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchTitle}>Default Account</Text>
              <Text style={styles.switchSub}>
                Use this account as the main payment source.
              </Text>
            </View>

            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: "#D1D5DB", true: "#86EFAC" }}
              thumbColor={isDefault ? "#08C742" : "#FFFFFF"}
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, creating && styles.disabled]}
            onPress={handleCreate}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#EAF3F2",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 34,
    paddingHorizontal: 18,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 16,
  },
  backText: {
    color: "#334155",
    fontWeight: "700",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#ECFDF5",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 10,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    margin: 16,
    borderRadius: 26,
    padding: 20,
  },
  iconBox: {
    width: 68,
    height: 68,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  formTitle: {
    color: "#102E59",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18,
  },
  label: {
    color: "#223B63",
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#F4F5F7",
    paddingHorizontal: 16,
    color: "#102E59",
    fontSize: 16,
  },
  switchRow: {
    marginTop: 20,
    backgroundColor: "#F4F5F7",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchTitle: {
    color: "#102E59",
    fontWeight: "900",
    fontSize: 16,
  },
  switchSub: {
    color: "#64748B",
    marginTop: 4,
    maxWidth: 250,
  },
  createButton: {
    height: 64,
    borderRadius: 20,
    backgroundColor: "#08C742",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
  },
  disabled: {
    opacity: 0.6,
  },
});