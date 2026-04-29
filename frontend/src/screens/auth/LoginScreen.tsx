import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import AppInput from "../../components/AppInput";
import AppButton from "../../components/AppButton";
import { loginApi } from "../../api/auth.api";
import { saveToken } from "../../utils/tokenStorage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert("Validation", "Email and password are required");
        return;
      }

      setLoading(true);

      const response = await loginApi({
        email,
        password,
      });

      await saveToken(response.token);

      Alert.alert(
        "Login Success",
        `Welcome ${response.user.fullName}\nInvite Code: ${response.inviteCode || "N/A"}`
      );
    } catch (error: any) {
      Alert.alert("Login Failed", error.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

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

        <AppButton title="Login" onPress={handleLogin} loading={loading} />
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
});
