import { Alert, ScrollView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { streakService } from '../../services/streak.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';
import { Streak } from '../../types';

const BADGE_INFO = {
  week: { emoji: '🏅', label: '7-Day Streak', color: '#FACC15' },
  month: { emoji: '🥇', label: '30-Day Streak', color: '#FB923C' },
  century: { emoji: '💎', label: '100-Day Streak', color: '#A78BFA' },
};

const MILESTONES = [7, 30, 100];

export default function StreakScreen() {
  const queryClient = useQueryClient();

  const { data: streak, isLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: () => streakService.getStreak().then((r) => r.data.data as Streak),
  });

  const recoverMutation = useMutation({
    mutationFn: () => streakService.recoverStreak(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['streak'] });
      Alert.alert('Recovered! 🔥', 'Your streak has been restored');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Cannot recover streak');
    },
  });

  if (isLoading) {
    return (
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </LinearGradient>
    );
  }

  const progress = streak ? (streak.currentStreak % 7) / 7 : 0;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Streak 🔥</Text>

        <GlassCard style={styles.mainCard}>
          <Text style={styles.streakNumber}>{streak?.currentStreak || 0}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.nextMilestone}>
            Next milestone: {MILESTONES.find((m) => m > (streak?.currentStreak || 0)) || '∞'} days
          </Text>
        </GlassCard>

        <View style={styles.stats}>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{streak?.longestStreak || 0}</Text>
            <Text style={styles.statLabel}>Longest Streak</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={styles.statValue}>{streak?.recoveryTokens || 0}</Text>
            <Text style={styles.statLabel}>Recovery Tokens</Text>
          </GlassCard>
        </View>

        <Text style={styles.sectionTitle}>Badges</Text>
        <View style={styles.badges}>
          {Object.entries(BADGE_INFO).map(([key, info]) => {
            const earned = streak?.badges?.includes(key as any);
            return (
              <GlassCard key={key} style={[styles.badge, !earned && styles.badgeLocked]}>
                <Text style={{ fontSize: 36, opacity: earned ? 1 : 0.3 }}>{info.emoji}</Text>
                <Text style={[styles.badgeLabel, !earned && { color: COLORS.muted }]}>{info.label}</Text>
                {earned && <Text style={[styles.badgeEarned, { color: info.color }]}>Earned!</Text>}
              </GlassCard>
            );
          })}
        </View>

        {(streak?.recoveryTokens || 0) > 0 && (
          <View style={styles.recoverySection}>
            <Text style={styles.recoveryText}>
              Missed a day? Use a recovery token to keep your streak alive!
            </Text>
            <PingButton
              title={`🛡 Recover Streak (${streak?.recoveryTokens} left)`}
              variant="outline"
              onPress={() => recoverMutation.mutate()}
              loading={recoverMutation.isPending}
            />
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
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  mainCard: { alignItems: 'center', gap: 8, paddingVertical: 32 },
  streakNumber: { fontSize: 72, fontWeight: '900', color: COLORS.primary },
  streakLabel: { fontSize: 18, color: COLORS.muted, fontWeight: '600' },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A2A3E',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  nextMilestone: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 32, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.muted, textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  badges: { flexDirection: 'row', gap: 12 },
  badge: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 20 },
  badgeLocked: { opacity: 0.5 },
  badgeLabel: { fontSize: 12, color: COLORS.text, textAlign: 'center', fontWeight: '600' },
  badgeEarned: { fontSize: 11, fontWeight: '700' },
  recoverySection: { gap: 12 },
  recoveryText: { fontSize: 14, color: COLORS.muted, lineHeight: 20, textAlign: 'center' },
});
