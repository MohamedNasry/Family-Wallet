import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { getToken } from "@/src/utils/tokenStorage";

export default function IndexScreen() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();

      // if (token) {
      //   router.replace("/(tabs)" as any);
      // } else {
      //   router.replace("/(auth)/welcome");
      // }

      router.replace("/(auth)/welcome");
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#08C742" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF3F2",
    justifyContent: "center",
    alignItems: "center",
  },
});