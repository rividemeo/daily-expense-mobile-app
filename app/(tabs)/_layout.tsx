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

// Floating dark pill with icon-only tabs and a white "+" in the middle.
function PillTabBar({ state, navigation }: TabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const routes = state.routes.filter((r) => ICONS[r.name]);
  const active = state.routes[state.index]?.key;

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
        style={[styles.tab, focused && styles.tabOn]}
      >
        <Ionicons name={focused ? icon.on : icon.off} size={22} color={focused ? '#FFFFFF' : '#9A9AA0'} />
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.pill, isDark && styles.pillDark]}>
        {routes.slice(0, 2).map(tabButton)}
        <Pressable
          onPress={() => router.push('/transaction/new')}
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
          style={({ pressed }) => [styles.add, { opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="add" size={28} color="#111114" />
        </Pressable>
        {routes.slice(2).map(tabButton)}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(p) => <PillTabBar {...p} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="transactions" />
      <Tabs.Screen name="budgets" />
      <Tabs.Screen name="reports" />
      <Tabs.Screen name="more" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: { alignItems: 'center', paddingTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#16161A',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pillDark: { borderWidth: 1, borderColor: '#2C2C2E' },
  tab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: '#3A3A40' },
  add: { width: 72, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
