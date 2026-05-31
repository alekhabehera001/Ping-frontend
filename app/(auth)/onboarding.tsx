import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '💬',
    title: 'Daily Questions',
    desc: 'Answer one meaningful question together every day and grow closer.',
  },
  {
    id: '2',
    emoji: '😊',
    title: 'Mood Pings',
    desc: "Let your partner know how you're feeling in real-time, even from miles away.",
  },
  {
    id: '3',
    emoji: '📸',
    title: 'Shared Memories',
    desc: 'Build your couple timeline with photos, voice notes, and memories.',
  },
  {
    id: '4',
    emoji: '🔥',
    title: 'Streaks & Badges',
    desc: 'Stay consistent and unlock milestones as a couple.',
  },
];

export default function Onboarding() {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const slide = SLIDES[current];

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.slideContent}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.desc}>{slide.desc}</Text>
      </View>

      <View style={styles.buttons}>
        <PingButton
          title={current === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
          style={styles.btn}
        />
        {current < SLIDES.length - 1 && (
          <PingButton
            title="Skip"
            variant="ghost"
            onPress={() => router.replace('/(auth)/login')}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 32, paddingTop: 80, paddingBottom: 48 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 60 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  slideContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  emoji: { fontSize: 80 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  desc: {
    fontSize: 16,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  buttons: { gap: 8 },
  btn: { width: '100%' },
});
