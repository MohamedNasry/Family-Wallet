import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="currency" />
      <Stack.Screen name="join-with-invite" />
      <Stack.Screen name="family-code" />
    </Stack>
  );
}