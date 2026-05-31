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
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../constants/config';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await authService.login(data.email.trim().toLowerCase(), data.password);
      const { user, tokens } = res.data.data;
      await setAuth(user, tokens);
      router.replace('/(app)');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logo}>❤️</Text>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to connect with your partner</Text>
          </View>

          <View style={styles.form}>
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
              rules={{ required: 'Password is required' }}
              render={({ field: { onChange, value } }) => (
                <PingInput
                  label="Password"
                  placeholder="Your password"
                  isPassword
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotBtn}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <PingButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              style={styles.btn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                <Text style={styles.link}>Sign Up</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  form: { gap: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 8, marginTop: -4 },
  forgotText: { color: COLORS.primary, fontSize: 13 },
  btn: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: COLORS.muted, fontSize: 14 },
  link: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
});
