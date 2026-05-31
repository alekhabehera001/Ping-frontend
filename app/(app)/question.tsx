import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService } from '../../services/question.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';
import { Question } from '../../types';

export default function QuestionScreen() {
  const { questionId } = useLocalSearchParams<{ questionId: string }>();
  const [answer, setAnswer] = useState('');
  const queryClient = useQueryClient();

  const { data: question } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionService.getToday().then((r) => r.data.data as Question),
    enabled: !!questionId,
  });

  const { data: answersData } = useQuery({
    queryKey: ['today-answers', questionId],
    queryFn: () => questionService.getTodayAnswers(questionId).then((r) => r.data.data),
    enabled: !!questionId,
  });

  const submitMutation = useMutation({
    mutationFn: () => questionService.submitAnswer(questionId, answer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['today-answers', questionId] });
      Alert.alert('Submitted!', "Your answer is saved. Waiting for your partner...", [
        { text: 'View', onPress: () => router.replace({ pathname: '/(app)/reveal', params: { questionId } }) },
        { text: 'Home', onPress: () => router.replace('/(app)') },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit');
    },
  });

  const alreadyAnswered = !!answersData?.myAnswer;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <PingButton title="← Back" variant="ghost" onPress={() => router.back()} />
            <Text style={styles.title}>Today's Question</Text>
          </View>

          <GlassCard style={styles.questionCard}>
            <Text style={styles.category}>{question?.category?.replace('_', ' ')}</Text>
            <Text style={styles.questionText}>{question?.text}</Text>
          </GlassCard>

          {alreadyAnswered ? (
            <GlassCard style={styles.answeredCard}>
              <Text style={styles.answeredLabel}>Your answer ✅</Text>
              <Text style={styles.answeredText}>{answersData.myAnswer?.text}</Text>
              {answersData.bothAnswered ? (
                <PingButton
                  title="View Both Answers 🎉"
                  onPress={() => router.replace({ pathname: '/(app)/reveal', params: { questionId } })}
                  style={styles.btn}
                />
              ) : (
                <Text style={styles.waitingText}>⏳ Waiting for your partner's answer...</Text>
              )}
            </GlassCard>
          ) : (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Your Answer</Text>
              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Share your thoughts..."
                placeholderTextColor={COLORS.muted}
                multiline
                maxLength={1000}
                style={styles.input}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{answer.length}/1000</Text>
              <PingButton
                title="Submit Answer"
                onPress={() => submitMutation.mutate()}
                loading={submitMutation.isPending}
                disabled={answer.trim().length < 1}
                style={styles.btn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  questionCard: { gap: 12 },
  category: { fontSize: 11, fontWeight: '700', color: COLORS.primary, textTransform: 'uppercase', letterSpacing: 1 },
  questionText: { fontSize: 22, fontWeight: '700', color: COLORS.text, lineHeight: 30 },
  answeredCard: { gap: 12 },
  answeredLabel: { fontSize: 13, color: COLORS.success, fontWeight: '600' },
  answeredText: { fontSize: 17, color: COLORS.text, lineHeight: 24 },
  waitingText: { color: COLORS.muted, fontSize: 14, textAlign: 'center' },
  inputSection: { gap: 12 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
    minHeight: 140,
  },
  charCount: { color: COLORS.muted, fontSize: 12, textAlign: 'right', marginTop: -8 },
  btn: { marginTop: 4 },
});
