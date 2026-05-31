import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { PingButton } from '../../components/PingButton';
import { PingInput } from '../../components/PingInput';
import { authService } from '../../services/auth.service';
import { COLORS } from '../../constants/config';

interface ForgotForm {
  email: string;
  userId?: string;
  otp?: string;
  newPassword?: string;
}

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const { control, handleSubmit, formState: { errors }, watch } = useForm<ForgotForm>();

  const handleEmail = async (data: ForgotForm) => {
    setLoading(true);
    try {
      const res = await authService.forgotPassword(data.email!);
      Alert.alert('Sent!', 'If that email exists, a reset OTP has been sent');
      setStep('otp');
    } catch {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleOtp = async (data: ForgotForm) => {
    setLoading(true);
    try {
      const res = await authService.verifyResetOtp(userId, data.otp!);
      setVerificationToken(res.data.data.verificationToken);
      setStep('reset');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authService.resetPassword(verificationToken, data.newPassword!, data.newPassword!);
      Alert.alert('Success', 'Password reset successfully', [
        { text: 'Login', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🔐</Text>
            <Text style={styles.title}>
              {step === 'email' ? 'Forgot password?' : step === 'otp' ? 'Enter OTP' : 'New password'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'email'
                ? "Enter your email and we'll send a reset code"
                : step === 'otp'
                ? 'Check your email for the 6-digit code'
                : 'Choose a strong new password'}
            </Text>
          </View>

          {step === 'email' && (
            <>
              <Controller
                control={control}
                name="email"
                rules={{ required: 'Email required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
                render={({ field: { onChange, value } }) => (
                  <PingInput
                    label="Email"
                    placeholder="your@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <PingButton title="Send Reset Code" onPress={handleSubmit(handleEmail)} loading={loading} style={styles.btn} />
            </>
          )}

          {step === 'otp' && (
            <>
              <Controller
                control={control}
                name="userId"
                rules={{ required: 'User ID required' }}
                render={({ field: { onChange, value } }) => (
                  <PingInput
                    label="User ID"
                    placeholder="Paste your user ID"
                    value={value}
                    onChangeText={(v) => { onChange(v); setUserId(v); }}
                    error={errors.userId?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="otp"
                rules={{ required: 'OTP required', length: { value: 6, message: '6 digits required' } as any }}
                render={({ field: { onChange, value } }) => (
                  <PingInput
                    label="OTP Code"
                    placeholder="6-digit code"
                    keyboardType="numeric"
                    maxLength={6}
                    value={value}
                    onChangeText={onChange}
                    error={errors.otp?.message}
                  />
                )}
              />
              <PingButton title="Verify OTP" onPress={handleSubmit(handleOtp)} loading={loading} style={styles.btn} />
            </>
          )}

          {step === 'reset' && (
            <>
              <Controller
                control={control}
                name="newPassword"
                rules={{ required: 'Password required', minLength: { value: 8, message: 'Min 8 chars' } }}
                render={({ field: { onChange, value } }) => (
                  <PingInput
                    label="New Password"
                    placeholder="Minimum 8 characters"
                    isPassword
                    value={value}
                    onChangeText={onChange}
                    error={errors.newPassword?.message}
                  />
                )}
              />
              <PingButton title="Reset Password" onPress={handleSubmit(handleReset)} loading={loading} style={styles.btn} />
            </>
          )}

          <PingButton title="Back to Login" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  btn: { marginBottom: 12 },
});
