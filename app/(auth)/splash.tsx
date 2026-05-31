import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { COLORS } from '../../constants/config';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/onboarding');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E', '#16213E']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>❤️</Text>
        <Text style={styles.title}>Ping</Text>
        <Text style={styles.subtitle}>Stay close, always</Text>
      </View>
      <Text style={styles.tagline}>Made with love ✨</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', gap: 12 },
  emoji: { fontSize: 72 },
  title: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.muted,
    letterSpacing: 1,
  },
  tagline: {
    position: 'absolute',
    bottom: 48,
    color: COLORS.muted,
    fontSize: 13,
  },
});
