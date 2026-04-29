import { useState } from "react";
import { View, TextInput, Pressable, Text } from "react-native";
import client from "../../src/api/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    await client.post("/login", { email, password });
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <TextInput placeholder="Email" onChangeText={setEmail} />
      <TextInput placeholder="Password" onChangeText={setPassword} secureTextEntry />

      <Pressable onPress={login} style={{ marginTop: 20, backgroundColor: "black", padding: 12 }}>
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </Pressable>
    </View>
  );
}