import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { joinWithInviteApi } from "../../api/auth.api";
import { saveToken } from "../../utils/tokenStorage";
import type { UserRole } from "../../types/user.types";

export default function JoinWithInviteScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "PARENT">>("MEMBER");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    try {
      if (!fullName || !email || !password || !inviteCode || !role) {
        Alert.alert("Validation", "All fields are required");
        return;
      }

      setLoading(true);

      const response = await joinWithInviteApi({
        fullName,
        email,
        password,
        inviteCode,
        role,
      });

      await saveToken(response.token);

      Alert.alert("Success", `Welcome ${response.user.fullName}`);
    } catch (error: any) {
      Alert.alert("Join Failed", error.message || "Failed to join with invite code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Join via Code</Text>

        <AppInput placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <AppInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <AppInput
          placeholder="Invite Code"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
        />

        <Text style={styles.roleLabel}>Select Role</Text>

        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleButton, role === "MEMBER" && styles.roleButtonActive]}
            onPress={() => setRole("MEMBER")}
          >
            <Text style={[styles.roleText, role === "MEMBER" && styles.roleTextActive]}>
              MEMBER
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleButton, role === "CHILD" && styles.roleButtonActive]}
            onPress={() => setRole("CHILD")}
          >
            <Text style={[styles.roleText, role === "CHILD" && styles.roleTextActive]}>
              CHILD
            </Text>
          </TouchableOpacity>
        </View>

        <AppButton title="Join" onPress={handleJoin} loading={loading} />
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
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#102E59",
    textAlign: "center",
    marginBottom: 16,
  },
  roleLabel: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#17335C",
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#EFF1F3",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  roleButtonActive: {
    backgroundColor: "#08C742",
  },
  roleText: {
    color: "#17335C",
    fontWeight: "700",
    fontSize: 18,
  },
  roleTextActive: {
    color: "#fff",
  },
});