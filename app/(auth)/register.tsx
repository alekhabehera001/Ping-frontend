import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { PingButton } from '../../components/PingButton';
import { PingInput } from '../../components/PingInput';
import { authService } from '../../services/auth.service';
import { COLORS } from '../../constants/config';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await authService.register(data.email.trim().toLowerCase(), data.password, data.name.trim());
      const { userId } = res.data.data;
      router.push({ pathname: '/(auth)/verify-otp', params: { userId } });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>❤️</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Ping and connect with your partner</Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Name is required', minLength: { value: 2, message: 'Name too short' } }}
              render={({ field: { onChange, value } }) => (
                <PingInput
                  label="Full Name"
                  placeholder="Your name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
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

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Minimum 8 characters' },
                pattern: { value: /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, message: 'Must have uppercase, lowercase, and number' },
              }}
              render={({ field: { onChange, value } }) => (
                <PingInput
                  label="Password"
                  placeholder="Minimum 8 characters"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              rules={{
                required: 'Please confirm password',
                validate: (val) => val === password || 'Passwords do not match',
              }}
              render={({ field: { onChange, value } }) => (
                <PingInput
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <PingButton
              title="Create Account"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  form: { gap: 4 },
  btn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.muted, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
