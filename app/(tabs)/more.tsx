import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
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
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color ?? Colors.primary.main) + '18' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={color ?? Colors.primary.main} />
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
  const { colors, isDark } = useTheme();
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
          style={[styles.profileCard, { backgroundColor: Colors.primary.main }]}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.name ?? 'M').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'My Account'}</Text>
            <Text style={styles.profileSub}>Local Account · {user?.currency ?? 'IDR'}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.7)" />
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
            color="#F59E0B"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                color={Colors.primary.main}
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
            color="#10B981"
          />
          <Divider />
          <MenuItem
            icon="import"
            label="Import Data"
            onPress={() => router.push('/settings/import')}
            color="#14B8A6"
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ABOUT</Text>
        <View style={styles.section}>
          <MenuItem icon="information-outline" label="About ExpenseFlow" onPress={() => {}} />
          <Divider />
          <MenuItem icon="star-outline" label="Rate Us" onPress={() => {}} color="#F59E0B" />
        </View>

        <Text style={styles.version}>ExpenseFlow v1.0.0 · Offline Mode</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '800' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  profileCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, gap: 12, marginBottom: 8 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.white, fontSize: 17, fontWeight: '700' },
  profileSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginLeft: 4 },
  section: { borderRadius: 12, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '500' },
  menuDesc: { fontSize: 12, marginTop: 1 },
  version: { textAlign: 'center', color: Colors.grey[400], fontSize: 12, marginTop: 8 },
});
