import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  style?: ViewStyle;
};

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  style,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "primary" ? styles.primary : styles.outline,
        style,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#0AC443"} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === "primary" ? styles.primaryText : styles.outlineText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  primary: {
    backgroundColor: "#08C742",
  },
  outline: {
    borderWidth: 2,
    borderColor: "#08C742",
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 22,
    fontWeight: "700",
  },
  primaryText: {
    color: "#fff",
  },
  outlineText: {
    color: "#08C742",
  },
});