import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow } from '@/shared/components/ui/ListGroup';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space } from '@/shared/constants/theme';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', native: 'Bahasa Melayu' },
  { code: 'zh', name: 'Chinese (Simplified)', native: '中文（简体）' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
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
      <LargeTitle back title="Language" />
      <ScrollView contentContainerStyle={styles.content}>
        <ListGroup footer="More languages coming soon. App content will be translated in a future update.">
          {LANGUAGES.map((lang) => (
            <ListRow
              key={lang.code}
              title={lang.name}
              subtitle={lang.native}
              onPress={() => handleSelect(lang.code, lang.name)}
              selected={lang.code === selectedLanguage}
            />
          ))}
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: Space.md, paddingBottom: Space.xxl },
});
