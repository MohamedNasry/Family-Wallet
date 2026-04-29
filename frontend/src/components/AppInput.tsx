import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

type Props = TextInputProps;

export default function AppInput(props: Props) {
  return (
    <TextInput
      placeholderTextColor="#6B7280"
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    fontSize: 18,
    color: "#0F2D59",
    marginTop: 12,
  },
});