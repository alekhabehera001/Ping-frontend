import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { PingButton } from '../../components/PingButton';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../constants/config';

export default function VerifyOtpScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = useRef<TextInput[]>([]);
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((p) => p - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyPress = (key: string, idx: number) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert('Error', 'Enter 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(userId, code);
      const { user, tokens } = res.data.data;
      await setAuth(user, tokens);
      router.replace('/(app)');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendOtp(userId);
      setResendTimer(30);
      Alert.alert('Sent!', 'New OTP sent to your email');
    } catch {
      Alert.alert('Error', 'Could not resend OTP');
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>📬</Text>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to your email</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { if (r) refs.current[i] = r; }}
              value={digit}
              onChangeText={(v) => handleChange(v.slice(-1), i)}
              onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(key, i)}
              keyboardType="numeric"
              maxLength={1}
              style={[styles.otpBox, digit && styles.otpBoxFilled]}
              selectionColor={COLORS.primary}
            />
          ))}
        </View>

        <PingButton title="Verify" onPress={handleVerify} loading={loading} style={styles.btn} />

        <View style={styles.resend}>
          <Text style={styles.resendText}>Didn't receive it? </Text>
          {resendTimer > 0 ? (
            <Text style={styles.timer}>{resendTimer}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  content: { paddingHorizontal: 32, alignItems: 'center', gap: 16 },
  emoji: { fontSize: 56, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  otpRow: { flexDirection: 'row', gap: 12, marginVertical: 24 },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A2A3E',
    backgroundColor: '#1A1A2E',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  otpBoxFilled: { borderColor: COLORS.primary },
  btn: { width: '100%' },
  resend: { flexDirection: 'row', marginTop: 8 },
  resendText: { color: COLORS.muted, fontSize: 14 },
  timer: { color: COLORS.muted, fontSize: 14 },
  resendLink: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
