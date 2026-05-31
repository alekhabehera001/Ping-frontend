import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { questionService } from '../../services/question.service';
import { moodService } from '../../services/mood.service';
import { notificationService } from '../../services/notification.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { useAuthStore } from '../../store/auth.store';
import { COLORS, MOOD_EMOJIS } from '../../constants/config';
import { Question, Mood } from '../../types';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning ☀️';
  if (h < 17) return 'Good afternoon 🌤';
  return 'Good evening 🌙';
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: questionData, refetch: refetchQuestion, isLoading: loadingQ } = useQuery({
    queryKey: ['today-question'],
    queryFn: () => questionService.getToday().then((r) => r.data.data as Question),
  });

  const { data: moodData, refetch: refetchMood } = useQuery({
    queryKey: ['latest-moods'],
    queryFn: () => moodService.getLatest().then((r) => r.data.data),
  });

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 1).then((r) => r.data.data),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchQuestion(), refetchMood(), refetchNotifs()]);
    setRefreshing(false);
  };

  const partnerMood = moodData?.partnerMood as Mood | null;
  const unreadCount: number = notifData?.unread || 0;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.name}>{user?.name || 'Partner'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/notifications')}
              style={styles.bellBtn}
            >
              <Text style={styles.bellEmoji}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(app)/settings')} style={styles.avatar}>
              <Text style={styles.avatarEmoji}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {partnerMood && (
          <GlassCard style={styles.moodBanner}>
            <Text style={styles.moodBannerText}>
              Your partner is feeling {MOOD_EMOJIS[partnerMood.mood]} {partnerMood.mood}
            </Text>
          </GlassCard>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Question 💬</Text>
          {loadingQ ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : questionData ? (
            <GlassCard style={styles.questionCard}>
              <Text style={styles.category}>{questionData.category?.replace('_', ' ')}</Text>
              <Text style={styles.questionText}>{questionData.text}</Text>
              <PingButton
                title="Answer Now →"
                onPress={() => router.push({ pathname: '/(app)/question', params: { questionId: questionData._id } })}
                style={styles.answerBtn}
              />
            </GlassCard>
          ) : (
            <GlassCard>
              <Text style={{ color: COLORS.muted }}>No question today yet. Pull to refresh!</Text>
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/mood')}>
              <Text style={styles.actionEmoji}>💭</Text>
              <Text style={styles.actionLabel}>Send Mood</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/memories')}>
              <Text style={styles.actionEmoji}>📸</Text>
              <Text style={styles.actionLabel}>Memories</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/streak')}>
              <Text style={styles.actionEmoji}>🔥</Text>
              <Text style={styles.actionLabel}>Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(app)/couple-setup')}>
              <Text style={styles.actionEmoji}>💑</Text>
              <Text style={styles.actionLabel}>Couple</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 32, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  greeting: { fontSize: 13, color: COLORS.muted },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bellBtn: { position: 'relative', padding: 4 },
  bellEmoji: { fontSize: 24 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A2E',
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 20 },
  moodBanner: {
    backgroundColor: 'rgba(255,78,139,0.08)',
    borderColor: 'rgba(255,78,139,0.2)',
  },
  moodBannerText: { color: COLORS.text, fontSize: 14, textAlign: 'center' },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  questionCard: { gap: 12 },
  category: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  questionText: { fontSize: 20, fontWeight: '700', color: COLORS.text, lineHeight: 28 },
  answerBtn: { marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  actionEmoji: { fontSize: 32 },
  actionLabel: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
});
