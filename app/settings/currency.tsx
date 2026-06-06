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

export default function CurrencySettingsScreen() {
  const { colors } = useTheme();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Currency</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {CURRENCIES.map((currency) => {
          const isSelected = currency.code === selectedCurrency;
          return (
            <TouchableOpacity
              key={currency.code}
              style={[styles.item, { backgroundColor: colors.surface }]}
              onPress={() => handleSelect(currency.code)}
            >
              <View style={styles.symbolBox}>
                <Text style={[styles.symbol, { color: Colors.primary.main }]}>{currency.symbol}</Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]}>{currency.name}</Text>
                <Text style={[styles.code, { color: colors.textSecondary }]}>{currency.code}</Text>
              </View>
              {isSelected && (
                <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary.main} />
              )}
            </TouchableOpacity>
          );
        })}
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
  list: { padding: 16, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  symbolBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontSize: 16, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  code: { fontSize: 12, marginTop: 2 },
});
