import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

type Icon = keyof typeof Ionicons.glyphMap;
type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

// Tabs shown in the pill, in order; "More" opens from the menu button on Summary.
const ICONS: Record<string, { on: Icon; off: Icon; label: string }> = {
  index: { on: 'home', off: 'home-outline', label: 'Summary' },
  transactions: { on: 'receipt', off: 'receipt-outline', label: 'Transactions' },
  budgets: { on: 'wallet', off: 'wallet-outline', label: 'Budgets' },
  reports: { on: 'pie-chart', off: 'pie-chart-outline', label: 'Spend analysis' },
};

// White bar with icon-only tabs and a raised round orange "+" in the middle.
function IconTabBar({ state, navigation }: TabBarProps) {
  const { colors, accent, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => ICONS[r.name]);
  const active = state.routes[state.index]?.key;
  const idle = isDark ? '#6E6E7A' : '#B9B9C6';

  const tabButton = (r: (typeof routes)[number]) => {
    const focused = r.key === active;
    const icon = ICONS[r.name];
    return (
      <Pressable
        key={r.key}
        onPress={() => !focused && navigation.navigate(r.name)}
        accessibilityRole="tab"
        accessibilityLabel={icon.label}
        accessibilityState={{ selected: focused }}
        style={styles.tab}
      >
        <Ionicons name={focused ? icon.on : icon.off} size={24} color={focused ? accent : idle} />
        <View style={[styles.dot, { backgroundColor: focused ? accent : 'transparent' }]} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
      {routes.slice(0, 2).map(tabButton)}
      <Pressable
        onPress={() => router.push('/transaction/new')}
        accessibilityRole="button"
        accessibilityLabel="Add transaction"
        style={({ pressed }) => [styles.add, { backgroundColor: accent, shadowColor: accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>
      {routes.slice(2).map(tabButton)}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <IconTabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: 8, borderTopWidth: StyleSheet.hairlineWidth },
  tab: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  add: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -14,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});
