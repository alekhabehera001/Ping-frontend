import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/config';

interface Props {
  children: React.ReactNode;
}

export function GradientBackground({ children }: Props) {
  return (
    <LinearGradient
      colors={[COLORS.bg, '#1A1A2E']}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
