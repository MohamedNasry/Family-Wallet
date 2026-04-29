import { useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import client from "../../src/api/client";

export default function Join() {
  const [inviteCode, setInviteCode] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const join = async () => {
    await client.post("/login-with-invite", {
      fullName,
      email,
      password,
      inviteCode,
      role: "CHILD",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Family</Text>

      <TextInput placeholder="Full Name" style={styles.input} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" style={styles.input} onChangeText={setPassword} />
      <TextInput placeholder="Invite Code" style={styles.input} onChangeText={setInviteCode} />

      <Pressable style={styles.btn} onPress={join}>
        <Text style={styles.btnText}>Join</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10 },
  btn: { backgroundColor: "#3498db", padding: 14, borderRadius: 10 },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});