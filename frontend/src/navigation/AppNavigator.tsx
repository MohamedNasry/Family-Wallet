import React from "react";
import { Stack } from "expo-router";

export function AppNavigator() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Stack.Screen name="bills" options={{ title: "Bills" }} />
      <Stack.Screen name="points" options={{ title: "Points" }} />
      <Stack.Screen name="family" options={{ title: "Family" }} />
      <Stack.Screen name="parental-control" options={{ title: "Parental Control" }} />
    </Stack>
  );
}

