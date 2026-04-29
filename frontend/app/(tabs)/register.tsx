import { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import client from "../../src/api/client";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");

  const handleRegister = async () => {
    await client.post("/register", {
      fullName,
      email,
      password,
      familyName,
      country,
      currency,
    });

    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Family</Text>

      <TextInput placeholder="Full Name" style={styles.input} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} onChangeText={setPassword} />
      <TextInput placeholder="Family Name" style={styles.input} onChangeText={setFamilyName} />
      <TextInput placeholder="Country" style={styles.input} onChangeText={setCountry} />
      <TextInput placeholder="Currency" style={styles.input} onChangeText={setCurrency} />

      <Pressable style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Register</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10 },
  btn: { backgroundColor: "#2ecc71", padding: 14, borderRadius: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});