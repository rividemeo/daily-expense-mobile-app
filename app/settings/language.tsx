import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';

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
  const { colors, accent } = useTheme();
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
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Language</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {LANGUAGES.map((lang, index) => {
          const isSelected = lang.code === selectedLanguage;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[styles.item, index > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}
              onPress={() => handleSelect(lang.code, lang.name)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.flagBox, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={styles.flag}>{lang.flag}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{lang.name}</Text>
                <Text style={[styles.native, { color: colors.textSecondary }]}>{lang.native}</Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={22} color={accent} />
              )}
            </TouchableOpacity>
          );
        })}
        </View>
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
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
  },
  backBtn: { width: TOUCH, height: TOUCH, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { ...Type.title },
  list: { padding: Space.lg, gap: Space.sm, paddingBottom: Space.xxl },
  card: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  flagBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: { fontSize: 22 },
  info: { flex: 1 },
  name: { ...Type.body, fontWeight: '500' },
  native: { ...Type.caption, marginTop: 2 },
  note: { ...Type.caption, textAlign: 'center', marginTop: Space.sm },
});
