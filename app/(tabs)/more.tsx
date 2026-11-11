import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';

interface MenuItemProps {
  icon: string;
  label: string;
  description?: string;
  onPress: () => void;
  color?: string;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, description, onPress, color, rightElement }: MenuItemProps) {
  const { colors, accent } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.menuIcon, { backgroundColor: (color ?? accent) + '1F' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color ?? accent} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        {description && <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{description}</Text>}
      </View>
      {rightElement ?? (
        <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { colors, accent, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { setTheme } = useUIStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>More</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <TouchableOpacity
          style={[styles.profileCard, { backgroundColor: colors.hero }]}
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: colors.onHero }]}>{(user?.name ?? 'M').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.onHero }]}>{user?.name ?? 'My Account'}</Text>
            <Text style={[styles.profileSub, { color: colors.onHeroMuted }]}>Local Account · {user?.currency ?? 'IDR'}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.onHeroMuted} />
        </TouchableOpacity>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>MANAGE</Text>
        <View style={styles.section}>
          <MenuItem
            icon="tag-multiple"
            label="Categories"
            description="Manage expense & income categories"
            onPress={() => router.push('/categories')}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SETTINGS</Text>
        <View style={styles.section}>
          <MenuItem
            icon={isDark ? 'weather-night' : 'weather-sunny'}
            label="Dark Mode"
            onPress={() => {}}
            color={Colors.warning.main}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                color={accent}
              />
            }
          />
          <Divider />
          <MenuItem
            icon="currency-usd"
            label="Currency"
            description={user?.currency ?? 'IDR'}
            onPress={() => router.push('/settings/currency')}
          />
          <Divider />
          <MenuItem
            icon="translate"
            label="Language"
            description="English"
            onPress={() => router.push('/settings/language')}
          />
          <Divider />
          <MenuItem
            icon="shield-lock-outline"
            label="Privacy & Security"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA</Text>
        <View style={styles.section}>
          <MenuItem
            icon="export"
            label="Export Data"
            description="CSV, Excel, PDF"
            onPress={() => router.push('/settings/export')}
            color={Colors.success.main}
          />
          <Divider />
          <MenuItem
            icon="import"
            label="Import Data"
            onPress={() => router.push('/settings/import')}
            color={Colors.info.main}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ABOUT</Text>
        <View style={styles.section}>
          <MenuItem icon="information-outline" label="About ExpenseFlow" onPress={() => {}} />
          <Divider />
          <MenuItem icon="star-outline" label="Rate Us" onPress={() => {}} color={Colors.warning.main} />
        </View>

        <Text style={[styles.version, { color: colors.textTertiary }]}>ExpenseFlow v1.0.0 · Offline Mode</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Space.lg, paddingTop: Space.sm, paddingBottom: Space.md },
  title: { ...Type.headline },
  content: { padding: Space.lg, gap: Space.sm, paddingBottom: Space.xxl + Space.sm },
  profileCard: { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.lg, padding: Space.lg, gap: Space.md, marginBottom: Space.sm },
  avatar: { width: 52, height: 52, borderRadius: Radius.pill, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Type.headline, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { ...Type.bodyLg, fontWeight: '700' },
  profileSub: { ...Type.body },
  sectionLabel: { ...Type.caption, fontWeight: '700', letterSpacing: 1, marginTop: Space.sm, marginLeft: Space.xs },
  section: { borderRadius: Radius.md, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Space.md, gap: Space.md, minHeight: TOUCH },
  menuIcon: { width: 40, height: 40, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { ...Type.body, fontWeight: '500' },
  menuDesc: { ...Type.caption, marginTop: 1 },
  version: { textAlign: 'center', ...Type.caption, marginTop: Space.sm },
});
