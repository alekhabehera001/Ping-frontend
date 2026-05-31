import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coupleService } from '../../services/couple.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';

export default function CoupleSetupScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [anniversaryInput, setAnniversaryInput] = useState('');
  const queryClient = useQueryClient();

  const { data: couple, isLoading } = useQuery({
    queryKey: ['couple'],
    queryFn: () => coupleService.getCouple().then((r) => r.data.data),
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: coupleService.generateInvite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to generate code');
    },
  });

  const joinMutation = useMutation({
    mutationFn: () => coupleService.joinCouple(inviteCode.trim().toUpperCase()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      Alert.alert('Connected! 💑', 'You are now connected with your partner!');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Invalid code');
    },
  });

  const anniversaryMutation = useMutation({
    mutationFn: () => coupleService.setAnniversary(anniversaryInput.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      setAnniversaryInput('');
      Alert.alert('Saved! 💍', 'Anniversary date saved');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Invalid date');
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: coupleService.unlinkPartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      Alert.alert('Unlinked', 'You have been unlinked from your partner');
    },
  });

  if (couple?.status === 'active') {
    const p1 = couple.user1;
    const p2 = couple.user2;
    return (
      <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <PingButton title="← Back" variant="ghost" onPress={() => router.back()} />
          <Text style={styles.title}>Your Couple 💑</Text>

          <GlassCard style={styles.coupleCard}>
            <View style={styles.avatarsRow}>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarEmoji}>👤</Text>
                <Text style={styles.avatarName}>{(p1 as any)?.name || 'Partner 1'}</Text>
              </View>
              <Text style={styles.heart}>❤️</Text>
              <View style={styles.avatarBox}>
                <Text style={styles.avatarEmoji}>👤</Text>
                <Text style={styles.avatarName}>{(p2 as any)?.name || 'Partner 2'}</Text>
              </View>
            </View>
            {couple.anniversary && (
              <Text style={styles.anniversary}>
                💍 Together since {new Date(couple.anniversary).toLocaleDateString()}
              </Text>
            )}
          </GlassCard>

          <GlassCard style={styles.section}>
            <Text style={styles.sectionTitle}>
              {couple.anniversary ? '✏️ Update Anniversary' : '💍 Set Anniversary'}
            </Text>
            <Text style={styles.sectionDesc}>
              Enter your anniversary date (YYYY-MM-DD)
            </Text>
            <TextInput
              value={anniversaryInput}
              onChangeText={setAnniversaryInput}
              placeholder="e.g. 2023-06-15"
              placeholderTextColor={COLORS.muted}
              style={styles.dateInput}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            <PingButton
              title="Save Anniversary"
              onPress={() => {
                if (!/^\d{4}-\d{2}-\d{2}$/.test(anniversaryInput.trim())) {
                  Alert.alert('Invalid format', 'Please use YYYY-MM-DD format');
                  return;
                }
                anniversaryMutation.mutate();
              }}
              loading={anniversaryMutation.isPending}
              disabled={anniversaryInput.trim().length < 8}
            />
          </GlassCard>

          <PingButton
            title="💔 Unlink Partner"
            variant="outline"
            onPress={() =>
              Alert.alert('Unlink?', 'This will break your couple connection.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Unlink', style: 'destructive', onPress: () => unlinkMutation.mutate() },
              ])
            }
            loading={unlinkMutation.isPending}
          />
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <PingButton title="← Back" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.title}>Connect with Partner 💑</Text>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Generate an invite code</Text>
          <Text style={styles.sectionDesc}>Share this code with your partner to connect</Text>
          {couple?.inviteCode ? (
            <View style={styles.codeBox}>
              <Text style={styles.code}>{couple.inviteCode}</Text>
              <Text style={styles.codeHint}>Share this with your partner</Text>
            </View>
          ) : (
            <PingButton
              title="Generate Invite Code"
              onPress={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            />
          )}
        </GlassCard>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Join with a code</Text>
          <Text style={styles.sectionDesc}>Enter the invite code from your partner</Text>
          <TextInput
            value={inviteCode}
            onChangeText={(v) => setInviteCode(v.toUpperCase())}
            placeholder="Enter code (e.g. ABC123)"
            placeholderTextColor={COLORS.muted}
            autoCapitalize="characters"
            maxLength={10}
            style={styles.codeInput}
          />
          <PingButton
            title="Join Couple"
            onPress={() => joinMutation.mutate()}
            loading={joinMutation.isPending}
            disabled={inviteCode.length < 4}
          />
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  coupleCard: { gap: 16, alignItems: 'center' },
  avatarsRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarBox: { alignItems: 'center', gap: 8 },
  avatarEmoji: { fontSize: 40 },
  avatarName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  heart: { fontSize: 32 },
  anniversary: { fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  sectionDesc: { fontSize: 14, color: COLORS.muted },
  codeBox: { alignItems: 'center', gap: 8 },
  code: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 8,
    backgroundColor: 'rgba(255,78,139,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  codeHint: { fontSize: 13, color: COLORS.muted },
  codeInput: {
    backgroundColor: '#0F0F1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    padding: 14,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  dateInput: {
    backgroundColor: '#0F0F1A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    padding: 14,
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
});
