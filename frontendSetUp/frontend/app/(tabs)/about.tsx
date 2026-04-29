import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function About() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}> About Page</Text>

      <Pressable
        onPress={() => router.back()}
        style={{
          backgroundColor: "green",
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Go Back</Text>
      </Pressable>
    </View>
  );
}