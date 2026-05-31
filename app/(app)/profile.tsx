import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { authService } from '../../services/auth.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { useAuthStore } from '../../store/auth.store';
import { useSocketStore } from '../../store/socket.store';
import { getRefreshToken } from '../../services/api';
import { COLORS } from '../../constants/config';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { disconnect } = useSocketStore();

  const { data: partnerData } = useQuery({
    queryKey: ['partner'],
    queryFn: () => api.get('/v1/users/partner').then((r) => r.data.data),
    retry: false,
  });

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            const refreshToken = await getRefreshToken();
            if (refreshToken) {
              await authService.logout(refreshToken);
            }
          } catch {
            // proceed with local logout even if backend call fails
          }
          disconnect();
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{user?.avatar ? '🖼' : '👤'}</Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {partnerData && (
          <GlassCard style={styles.partnerCard}>
            <Text style={styles.partnerLabel}>💑 Your Partner</Text>
            <View style={styles.partnerRow}>
              <View style={styles.partnerAvatar}>
                <Text style={{ fontSize: 24 }}>👤</Text>
              </View>
              <View>
                <Text style={styles.partnerName}>{partnerData.name}</Text>
                <Text style={styles.partnerEmail}>{partnerData.email}</Text>
              </View>
            </View>
          </GlassCard>
        )}

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/couple-setup')}>
            <Text style={styles.menuEmoji}>💑</Text>
            <Text style={styles.menuLabel}>Couple Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(app)/notifications')}>
            <Text style={styles.menuEmoji}>🔔</Text>
            <Text style={styles.menuLabel}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemLast]} onPress={() => router.push('/(app)/settings')}>
            <Text style={styles.menuEmoji}>⚙️</Text>
            <Text style={styles.menuLabel}>Settings</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <PingButton title="Log Out" variant="outline" onPress={handleLogout} style={styles.logoutBtn} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 24 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1A1A2E',
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.muted },
  partnerCard: { gap: 12 },
  partnerLabel: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  partnerRow: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  partnerEmail: { fontSize: 13, color: COLORS.muted },
  menu: { backgroundColor: '#1A1A2E', borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
  },
  menuItemLast: { borderBottomWidth: 0 },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '500' },
  menuArrow: { fontSize: 20, color: COLORS.muted },
  logoutBtn: { marginTop: 8 },
});
