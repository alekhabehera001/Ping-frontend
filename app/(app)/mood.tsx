import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodService } from '../../services/mood.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS, MOOD_COLORS, MOOD_EMOJIS } from '../../constants/config';
import { MoodType } from '../../types';

const MOODS: MoodType[] = ['happy', 'sad', 'stressed', 'angry', 'excited', 'loved', 'tired'];

export default function MoodScreen() {
  const [selected, setSelected] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const { data: moodData } = useQuery({
    queryKey: ['latest-moods'],
    queryFn: () => moodService.getLatest().then((r) => r.data.data),
  });

  const sendMutation = useMutation({
    mutationFn: () => moodService.sendMood(selected!, note || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latest-moods'] });
      Alert.alert('Sent! 💬', `Your partner now knows you're feeling ${selected}`);
      setSelected(null);
      setNote('');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'Failed to send mood');
    },
  });

  const myMood = moodData?.myMood;
  const partnerMood = moodData?.partnerMood;

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>How are you feeling? 💭</Text>

        {partnerMood && (
          <GlassCard style={[styles.partnerCard, { borderColor: `${MOOD_COLORS[partnerMood.mood]}40` }]}>
            <Text style={styles.partnerLabel}>Partner's mood</Text>
            <View style={styles.partnerMoodRow}>
              <Text style={{ fontSize: 40 }}>{MOOD_EMOJIS[partnerMood.mood]}</Text>
              <View>
                <Text style={[styles.moodName, { color: MOOD_COLORS[partnerMood.mood] }]}>
                  {partnerMood.mood}
                </Text>
                {partnerMood.note && <Text style={styles.moodNote}>{partnerMood.note}</Text>}
              </View>
            </View>
          </GlassCard>
        )}

        <Text style={styles.sectionLabel}>Pick your mood</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodTile,
                selected === mood && { borderColor: MOOD_COLORS[mood], borderWidth: 2.5 },
              ]}
              onPress={() => setSelected(mood)}
            >
              <Text style={styles.moodEmoji}>{MOOD_EMOJIS[mood]}</Text>
              <Text style={[styles.moodLabel, selected === mood && { color: MOOD_COLORS[mood] }]}>
                {mood}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionLabel}>Add a note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Tell your partner more..."
              placeholderTextColor={COLORS.muted}
              maxLength={200}
              style={styles.noteInput}
            />
          </View>
        )}

        <PingButton
          title={`Send ${selected ? MOOD_EMOJIS[selected] : '💬'} to Partner`}
          onPress={() => sendMutation.mutate()}
          loading={sendMutation.isPending}
          disabled={!selected}
          style={styles.sendBtn}
        />

        {myMood && (
          <GlassCard>
            <Text style={styles.partnerLabel}>Your last mood</Text>
            <Text style={styles.moodName}>
              {MOOD_EMOJIS[myMood.mood]} {myMood.mood}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },
  pageTitle: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  partnerCard: { borderWidth: 1 },
  partnerLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  partnerMoodRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  moodName: { fontSize: 20, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' },
  moodNote: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moodTile: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  moodEmoji: { fontSize: 32 },
  moodLabel: { fontSize: 12, color: COLORS.muted, textTransform: 'capitalize', fontWeight: '600' },
  noteSection: { gap: 8 },
  noteInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
    minHeight: 80,
  },
  sendBtn: { marginTop: 4 },
});
