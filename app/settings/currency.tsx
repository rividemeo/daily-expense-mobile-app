import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CURRENCIES } from '@/shared/constants/currencies';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow } from '@/shared/components/ui/ListGroup';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space } from '@/shared/constants/theme';

export default function CurrencySettingsScreen() {
  const { colors, accent } = useTheme();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { showSnackbar } = useUIStore();

  const selectedCurrency = user?.currency ?? 'IDR';

  const handleSelect = (code: string) => {
    updateUser({ currency: code });
    showSnackbar(`Currency changed to ${code}`, 'success');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle back title="Currency" />
      <ScrollView contentContainerStyle={styles.content}>
        <ListGroup>
          {CURRENCIES.map((c) => (
            <ListRow
              key={c.code}
              title={c.name}
              subtitle={`${c.code} · ${c.symbol}`}
              onPress={() => handleSelect(c.code)}
              selected={c.code === selectedCurrency}
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
