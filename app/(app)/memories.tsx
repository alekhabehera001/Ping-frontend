import { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memoryService } from '../../services/memory.service';
import { GlassCard } from '../../components/GlassCard';
import { PingButton } from '../../components/PingButton';
import { COLORS } from '../../constants/config';
import { Memory } from '../../types';

export default function MemoriesScreen() {
  const [tab, setTab] = useState<'timeline' | 'add'>('timeline');
  const [caption, setCaption] = useState('');
  const [note, setNote] = useState('');
  const [memType, setMemType] = useState<'photo' | 'note'>('photo');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['memories-timeline'],
    queryFn: () => memoryService.getTimeline().then((r) => r.data.data),
  });

  const addNoteMutation = useMutation({
    mutationFn: () => memoryService.createMemory({ type: 'note', noteText: note, caption }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories-timeline'] });
      setNote('');
      setCaption('');
      setTab('timeline');
      Alert.alert('Saved!', 'Note memory added ❤️');
    },
  });

  const pickAndUploadPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Photo access required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    setUploading(true);
    try {
      const presignedRes = await memoryService.getPresigned(mimeType, `memory.${ext}`);
      const { uploadUrl, key } = presignedRes.data.data;

      const blob = await (await fetch(asset.uri)).blob();
      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': mimeType }, body: blob });

      await memoryService.createMemory({ type: 'photo', s3Key: key, caption });
      queryClient.invalidateQueries({ queryKey: ['memories-timeline'] });
      setCaption('');
      setTab('timeline');
      Alert.alert('Uploaded! 📸', 'Photo memory saved');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const memories: Memory[] = data?.items || [];

  return (
    <LinearGradient colors={['#0F0F1A', '#1A1A2E']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Memories 📸</Text>
        <View style={styles.tabs}>
          <TouchableOpacity onPress={() => setTab('timeline')} style={[styles.tab, tab === 'timeline' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'timeline' && styles.tabTextActive]}>Timeline</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('add')} style={[styles.tab, tab === 'add' && styles.tabActive]}>
            <Text style={[styles.tabText, tab === 'add' && styles.tabTextActive]}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'timeline' ? (
        <FlatList
          data={memories}
          keyExtractor={(m) => m._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GlassCard style={styles.memoryCard}>
              {item.type === 'photo' && item.s3Url && (
                <Image source={{ uri: item.s3Url }} style={styles.image} />
              )}
              {item.type === 'note' && item.noteText && (
                <View style={styles.noteCard}>
                  <Text style={styles.noteIcon}>📝</Text>
                  <Text style={styles.noteText}>{item.noteText}</Text>
                </View>
              )}
              {item.caption && <Text style={styles.caption}>{item.caption}</Text>}
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </GlassCard>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🌟</Text>
              <Text style={styles.emptyText}>No memories yet</Text>
              <Text style={styles.emptySubtext}>Start building your story together!</Text>
            </View>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={styles.addForm} keyboardShouldPersistTaps="handled">
          <View style={styles.typeRow}>
            <TouchableOpacity onPress={() => setMemType('photo')} style={[styles.typeBtn, memType === 'photo' && styles.typeBtnActive]}>
              <Text>📸 Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMemType('note')} style={[styles.typeBtn, memType === 'note' && styles.typeBtnActive]}>
              <Text>📝 Note</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Caption (optional)"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            maxLength={500}
          />

          {memType === 'note' && (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Write your memory..."
              placeholderTextColor={COLORS.muted}
              multiline
              maxLength={2000}
              style={[styles.input, styles.noteInput]}
              textAlignVertical="top"
            />
          )}

          {memType === 'photo' ? (
            <PingButton title="📸 Pick Photo" onPress={pickAndUploadPhoto} loading={uploading} />
          ) : (
            <PingButton
              title="Save Memory ❤️"
              onPress={() => addNoteMutation.mutate()}
              loading={addNoteMutation.isPending}
              disabled={!note.trim()}
            />
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, gap: 16 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  tabs: { flexDirection: 'row', backgroundColor: '#1A1A2E', borderRadius: 12, padding: 4, gap: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, color: COLORS.muted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  memoryCard: { gap: 12 },
  image: { width: '100%', height: 220, borderRadius: 12 },
  noteCard: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  noteIcon: { fontSize: 24 },
  noteText: { flex: 1, fontSize: 16, color: COLORS.text, lineHeight: 24 },
  caption: { fontSize: 14, color: COLORS.muted, fontStyle: 'italic' },
  date: { fontSize: 11, color: COLORS.muted },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.muted },
  addForm: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
  },
  typeBtnActive: { borderColor: COLORS.primary },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2A2A3E',
    padding: 14,
    color: COLORS.text,
    fontSize: 15,
  },
  noteInput: { minHeight: 120 },
});
