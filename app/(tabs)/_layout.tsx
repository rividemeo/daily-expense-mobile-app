import { StyleSheet, ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

type Icon = keyof typeof Ionicons.glyphMap;
// iOS tab bar: filled glyph when selected, outline otherwise.
const tab = (title: string, on: Icon, off: Icon) => ({
  title,
  tabBarIcon: ({ color, focused }: { color: ColorValue; focused: boolean }) => (
    <Ionicons name={focused ? on : off} color={color} size={25} />
  ),
});

export default function TabsLayout() {
  const { colors, accent, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: isDark ? 'rgba(22,22,24,0.94)' : 'rgba(249,249,249,0.94)',
          borderTopColor: colors.divider,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          height: 64,
          paddingTop: 4,
          paddingBottom: 4,
        },
        // 10pt like iOS so "Transactions" fits five tabs on a 375px phone.
        tabBarLabelStyle: { fontSize: 10, lineHeight: 13, fontWeight: '500' },
      }}
    >
      <Tabs.Screen name="index" options={tab('Summary', 'home', 'home-outline')} />
      <Tabs.Screen name="transactions" options={tab('Transactions', 'list', 'list-outline')} />
      <Tabs.Screen name="budgets" options={tab('Budgets', 'wallet', 'wallet-outline')} />
      <Tabs.Screen name="reports" options={tab('Reports', 'bar-chart', 'bar-chart-outline')} />
      <Tabs.Screen name="more" options={tab('More', 'ellipsis-horizontal-circle', 'ellipsis-horizontal-circle-outline')} />
    </Tabs>
  );
}
