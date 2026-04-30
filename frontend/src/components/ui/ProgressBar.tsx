import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

type ProgressBarProps = {
  progress: number;
  color?: string;
  style?: ViewStyle;
};

export default function ProgressBar({
  progress,
  color = "#08C742",
  style,
}: ProgressBarProps) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${safeProgress}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
