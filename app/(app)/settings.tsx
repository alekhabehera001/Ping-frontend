import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { api } from '../../services/api';
import { authService } from '../../services/auth.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { PingInput } from '../../components/PingInput';
import { useAuthStore } from '../../store/auth.store';
import { useSocketStore } from '../../store/socket.store';
import { clearTokens } from '../../services/api';
import { COLORS } from '../../constants/config';

interface ProfileForm {
  name: string;
}

export default function SettingsScreen() {
  const { user, updateUser, logout } = useAuthStore();
  const { disconnect } = useSocketStore();
  const [deleteStep, setDeleteStep] = useState<'idle' | 'otp'>('idle');
  const [deleteOtp, setDeleteOtp] = useState('');
  const [deletingConfirm, setDeletingConfirm] = useState(false);

  const { control, handleSubmit } = useForm<ProfileForm>({
    defaultValues: { name: user?.name || '' },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => api.patch('/v1/users/me', data),
    onSuccess: (res) => {
      updateUser(res.data.data);
      Alert.alert('Updated!', 'Profile saved');
    },
    onError: () => Alert.alert('Error', 'Failed to update profile'),
  });

  const requestDeleteMutation = useMutation({
    mutationFn: () => authService.requestDelete(),
    onSuccess: () => {
      setDeleteStep('otp');
    },
    onError: () => Alert.alert('Error', 'Could not send OTP. Try again.'),
  });

  const confirmDeleteMutation = useMutation({
    mutationFn: () => authService.deleteAccount(deleteOtp.trim()),
    onSuccess: async () => {
      disconnect();
      await clearTokens();
      logout();
      router.replace('/(auth)/login');
    },
    onError: (err: any) =>
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP or deletion failed'),
  });

  const handleRequestDelete = () => {
    Alert.alert('Delete Account', 'This is permanent. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: () => requestDeleteMutation.mutate(),
      },
    ]);
  };

  const handleConfirmDelete = () => {
    if (deleteOtp.trim().length !== 6) {
      Alert.alert('Error', 'Enter the 6-digit OTP');
      return;
    }
    setDeletingConfirm(true);
    confirmDeleteMutation.mutate();
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <PingButton title="← Back" variant="ghost" onPress={() => router.back()} />
          <Text style={styles.title}>Settings</Text>
        </View>

        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          <Controller
            control={control}
            name="name"
            rules={{ required: 'Name required', minLength: { value: 2, message: 'Too short' } }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <PingInput
                label="Display Name"
                placeholder="Your name"
                value={value}
                onChangeText={onChange}
                error={error?.message}
              />
            )}
          />
          <PingButton
            title="Save Profile"
            onPress={handleSubmit((d) => updateMutation.mutate(d))}
            loading={updateMutation.isPending}
          />
        </GlassCard>

        <GlassCard style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <PingButton
            title="🗑 Delete Account"
            variant="outline"
            onPress={handleRequestDelete}
            loading={requestDeleteMutation.isPending}
          />
        </GlassCard>
      </ScrollView>

      {/* OTP confirmation modal */}
      <Modal visible={deleteStep === 'otp'} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalSub}>
              A 6-digit OTP was sent to your email. Enter it below to permanently delete your account.
            </Text>
            <TextInput
              value={deleteOtp}
              onChangeText={setDeleteOtp}
              placeholder="6-digit OTP"
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              maxLength={6}
              style={styles.otpInput}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setDeleteStep('idle'); setDeleteOtp(''); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteBtn, deletingConfirm && styles.deleteBtnDisabled]}
                onPress={handleConfirmDelete}
                disabled={deletingConfirm || confirmDeleteMutation.isPending}
              >
                <Text style={styles.deleteBtnText}>
                  {confirmDeleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  section: { gap: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  dangerSection: { gap: 14, borderColor: 'rgba(248,113,113,0.3)', borderWidth: 1 },
  dangerTitle: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modal: {
    backgroundColor: '#1A1A2E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.3)',
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.error, textAlign: 'center' },
  modalSub: { fontSize: 14, color: COLORS.muted, textAlign: 'center', lineHeight: 20 },
  otpInput: {
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    padding: 14,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
  },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#2A2A3E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { color: COLORS.text, fontWeight: '600', fontSize: 15 },
  deleteBtn: {
    flex: 1,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  deleteBtnDisabled: { opacity: 0.5 },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
