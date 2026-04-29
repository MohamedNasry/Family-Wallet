import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import client from "../src/api/client";

export default function Register() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");

  const handleRegister = async () => {
    try {
      const res = await client.post("/register", {
        fullName,
        email,
        password,
        familyName,
        country,
        currency, // 🔥 مهم جدًا
      });

      console.log("REGISTER SUCCESS:", res.data);

      router.push("/login");
    } catch (err) {
      console.log("REGISTER ERROR:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Family Wallet</Text>

      <TextInput placeholder="Full Name" style={styles.input} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
      <TextInput placeholder="Family Name" style={styles.input} onChangeText={setFamilyName} />
      <TextInput placeholder="Country" style={styles.input} onChangeText={setCountry} />

      {/* 💰 CURRENCY SELECT */}
      <Text style={{ marginTop: 10, fontWeight: "bold" }}>Select Currency</Text>

      <View style={styles.row}>
        <Pressable
          style={[styles.currencyBtn, currency === "USD" && styles.active]}
          onPress={() => setCurrency("USD")}
        >
          <Text>USD</Text>
        </Pressable>

        <Pressable
          style={[styles.currencyBtn, currency === "EUR" && styles.active]}
          onPress={() => setCurrency("EUR")}
        >
          <Text>EUR</Text>
        </Pressable>

        <Pressable
          style={[styles.currencyBtn, currency === "MAD" && styles.active]}
          onPress={() => setCurrency("MAD")}
        >
          <Text>MAD</Text>
        </Pressable>
      </View>

      {/* CREATE BUTTON */}
      <Pressable style={styles.button} onPress={handleRegister}>
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Create Wallet
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  currencyBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },

  active: {
    backgroundColor: "#cce5ff",
  },

  button: {
    backgroundColor: "green",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});