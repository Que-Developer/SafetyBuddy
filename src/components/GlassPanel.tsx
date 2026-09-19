import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
};

export default function GlassPanel({ children, style }: Props) {
  return (
    <View style={[{ borderRadius: 14, backgroundColor: '#fce07a', overflow: 'hidden' }, style]}>
      {children}
    </View>
  );
}