import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';
import { Notification } from '../../types';

const TYPE_ICONS: Record<string, string> = {
  daily_question: '💬',
  partner_answered: '🎉',
  mood_ping: '💭',
  memory_shared: '📸',
  streak_milestone: '🔥',
};

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50).then((r) => r.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications: Notification[] = data?.items || [];
  const unread: number = data?.unread || 0;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <View style={styles.header}>
        <PingButton title="← Back" variant="ghost" onPress={() => router.back()} style={styles.back} />
        <Text style={styles.title}>Notifications</Text>
        {unread > 0 && (
          <PingButton
            title="Read all"
            variant="ghost"
            onPress={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
          />
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => !item.isRead && markReadMutation.mutate(item._id)}
              activeOpacity={item.isRead ? 1 : 0.7}
            >
              <GlassCard style={[styles.card, !item.isRead && styles.unreadCard]}>
                <View style={styles.row}>
                  <Text style={styles.icon}>{TYPE_ICONS[item.type] || '🔔'}</Text>
                  <View style={styles.content}>
                    <Text style={[styles.notifTitle, !item.isRead && styles.unreadTitle]}>
                      {item.title}
                    </Text>
                    <Text style={styles.body}>{item.body}</Text>
                    <Text style={styles.time}>
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  {!item.isRead && <View style={styles.dot} />}
                </View>
              </GlassCard>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySub}>We'll let you know when something happens!</Text>
            </View>
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  back: { marginRight: 4 },
  title: { flex: 1, fontSize: 22, fontWeight: '800', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  card: { padding: 14 },
  unreadCard: { borderColor: 'rgba(255,78,139,0.25)', backgroundColor: 'rgba(255,78,139,0.04)' },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { fontSize: 26, marginTop: 2 },
  content: { flex: 1, gap: 4 },
  notifTitle: { fontSize: 15, fontWeight: '600', color: COLORS.muted },
  unreadTitle: { color: COLORS.text },
  body: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  time: { fontSize: 11, color: COLORS.muted, marginTop: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', maxWidth: 260 },
});
