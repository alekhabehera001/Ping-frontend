import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '../../services/question.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';
import { User } from '../../types';

export default function RevealScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['reveal-answers', questionId],
    queryFn: () => questionService.getTodayAnswers(questionId).then((r) => r.data.data),
    enabled: !!questionId,
    refetchInterval: (data) => (data?.bothAnswered ? false : 5000),
  });

  const { data: question } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionService.getToday().then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <PingButton title="← Home" variant="ghost" onPress={() => router.replace('/(app)')} />

        <Text style={styles.title}>
          {data?.bothAnswered ? '🎉 Both answered!' : '⏳ Waiting...'}
        </Text>

        <GlassCard style={styles.questionCard}>
          <Text style={styles.questionText}>{question?.text}</Text>
        </GlassCard>

        <View style={styles.answers}>
          <Text style={styles.sectionLabel}>Your Answer</Text>
          <GlassCard style={styles.answerCard}>
            {data?.myAnswer ? (
              <Text style={styles.answerText}>{data.myAnswer.text}</Text>
            ) : (
              <Text style={styles.pending}>Not answered yet</Text>
            )}
          </GlassCard>

          <Text style={styles.sectionLabel}>Partner's Answer</Text>
          <GlassCard style={[styles.answerCard, styles.partnerCard]}>
            {data?.bothAnswered && data?.partnerAnswer ? (
              <Text style={styles.answerText}>{data.partnerAnswer.text}</Text>
            ) : (
              <Text style={styles.pending}>
                {data?.myAnswer ? '⏳ Waiting for partner...' : 'Not answered yet'}
              </Text>
            )}
          </GlassCard>
        </View>

        {data?.bothAnswered && (
          <View style={styles.celebration}>
            <Text style={styles.celebrationEmoji}>🎊</Text>
            <Text style={styles.celebrationText}>You both answered today!</Text>
            <Text style={styles.celebrationSub}>Your streak is growing stronger ❤️</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center' },
  questionCard: { backgroundColor: 'rgba(178,75,243,0.08)', borderColor: 'rgba(178,75,243,0.2)' },
  questionText: { fontSize: 18, color: COLORS.text, lineHeight: 26, textAlign: 'center', fontStyle: 'italic' },
  answers: { gap: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  answerCard: { minHeight: 80 },
  partnerCard: { backgroundColor: 'rgba(255,78,139,0.06)', borderColor: 'rgba(255,78,139,0.15)' },
  answerText: { fontSize: 17, color: COLORS.text, lineHeight: 26 },
  pending: { color: COLORS.muted, fontSize: 15, textAlign: 'center' },
  celebration: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  celebrationEmoji: { fontSize: 56 },
  celebrationText: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  celebrationSub: { fontSize: 15, color: COLORS.muted },
});
