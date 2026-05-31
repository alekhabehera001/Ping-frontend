import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/config';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  style?: ViewStyle;
}

export function PingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
}: Props) {
  const isDisabled = disabled || loading;

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[styles.outline, isDisabled && styles.disabled, style]}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </Pressable>
    );
  }

  if (variant === 'ghost') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={[styles.ghost, style]}>
        <Text style={styles.ghostText}>{title}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={onPress} disabled={isDisabled} style={[{ borderRadius: 16 }, style]}>
      <LinearGradient
        colors={isDisabled ? ['#555', '#444'] : ['#FF4E8B', '#B24BF3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryText}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  outline: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  ghost: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ghostText: {
    color: COLORS.muted,
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
});
