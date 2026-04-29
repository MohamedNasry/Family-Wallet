import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 22 }}> Home Page</Text>

      <Pressable
        onPress={() => router.push("/about")}
        style={{
          marginTop: 20,
          backgroundColor: "#FF0000",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white" }}>Go to About</Text>
      </Pressable>
    </View>
  );
}