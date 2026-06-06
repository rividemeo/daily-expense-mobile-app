import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文（简体）', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];

export default function LanguageSettingsScreen() {
  const { colors } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { showSnackbar } = useUIStore();

  const selectedLanguage = user?.language ?? 'en';

  const handleSelect = (code: string, name: string) => {
    updateUser({ language: code });
    showSnackbar(`Language changed to ${name}`, 'success');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {LANGUAGES.map((lang) => {
          const isSelected = lang.code === selectedLanguage;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.item, { backgroundColor: colors.surface }]}
              onPress={() => handleSelect(lang.code, lang.name)}
            >
              <View style={styles.flagBox}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{lang.name}</Text>
                <Text style={[styles.native, { color: colors.textSecondary }]}>{lang.native}</Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary.main} />
              )}
            </TouchableOpacity>
          );
        })}
        <Text style={[styles.note, { color: colors.textTertiary }]}>
          More languages coming soon. App content will be translated in a future update.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '700' },
  list: { padding: 16, gap: 8, paddingBottom: 32 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  flagBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.grey[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 24 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  native: { fontSize: 12, marginTop: 2 },
  note: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
