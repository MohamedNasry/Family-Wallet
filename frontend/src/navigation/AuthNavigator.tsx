import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import CurrencyScreen from "../screens/auth/CurrencyScreen";
import JoinWithInviteScreen from "../screens/auth/JoinWithInviteScreen";
import FamilyCodeScreen from "../screens/auth/FamilyCodeScreen";

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Currency: {
    registerData: {
      fullName: string;
      email: string;
      password: string;
      familyName: string;
      country: string;
    };
  };
  JoinWithInvite: undefined;
  FamilyCode: {
    inviteCode: string;
  };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Currency" component={CurrencyScreen} />
      <Stack.Screen name="JoinWithInvite" component={JoinWithInviteScreen} />
      <Stack.Screen name="FamilyCode" component={FamilyCodeScreen} />
    </Stack.Navigator>
  );
}