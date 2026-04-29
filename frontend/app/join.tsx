import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import client from "../src/api/client";

export default function Join() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [role, setRole] = useState("CHILD");

  const handleJoin = async () => {
    try {
      const res = await client.post("/login-with-invite", {
        fullName,
        email,
        password,
        inviteCode,
        role,
      });

      console.log("JOIN SUCCESS:", res.data);

      router.push("/(tabs)");
    } catch (err) {
      console.log("JOIN ERROR:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Family</Text>

      <TextInput placeholder="Full Name" style={styles.input} onChangeText={setFullName} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={setPassword} />
      <TextInput placeholder="Invite Code" style={styles.input} onChangeText={setInviteCode} />

      {/* Role buttons */}
      <View style={styles.row}>
        <Pressable onPress={() => setRole("CHILD")} style={styles.roleBtn}>
          <Text>Child</Text>
        </Pressable>

        <Pressable onPress={() => setRole("MEMBER")} style={styles.roleBtn}>
          <Text>Member</Text>
        </Pressable>
      </View>

      <Pressable style={styles.button} onPress={handleJoin}>
        <Text style={{ color: "white" }}>Join</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
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

  roleBtn: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },

  button: {
    backgroundColor: "green",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});