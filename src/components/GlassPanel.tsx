import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export default function GlassPanel({ children, style, radius = 14 }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          borderRadius: radius,
          backgroundColor: colors.card,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
