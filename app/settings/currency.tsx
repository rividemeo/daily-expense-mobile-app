import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { CURRENCIES } from '@/shared/constants/currencies';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';

export default function CurrencySettingsScreen() {
  const { colors, accent, isDark } = useTheme();
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Currency</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {CURRENCIES.map((currency, index) => {
          const isSelected = currency.code === selectedCurrency;
          return (
            <TouchableOpacity
              key={currency.code}
              style={[styles.item, index > 0 && { borderTopWidth: 1, borderTopColor: colors.divider }]}
              onPress={() => handleSelect(currency.code)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <View style={[styles.symbolBox, { backgroundColor: isDark ? 'rgba(45,212,191,0.12)' : Colors.primary[50] }]}>
                <Text style={[styles.symbol, { color: accent }]}>{currency.symbol}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{currency.name}</Text>
                <Text style={[styles.code, { color: colors.textSecondary }]}>{currency.code}</Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={22} color={accent} />
              )}
            </TouchableOpacity>
          );
        })}
        </View>
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
  list: { padding: Space.lg },
  card: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  symbolBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { ...Type.bodyLg, fontWeight: '600' },
  info: { flex: 1 },
  name: { ...Type.body, fontWeight: '500' },
  code: { ...Type.caption, marginTop: 2 },
});
