import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export function GlassPanel({ children, style, radius = 14 }: Props) {
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

export default GlassPanel;
