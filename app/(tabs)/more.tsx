import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Space, Type } from '@/shared/constants/theme';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow, ROW_ICON_INSET } from '@/shared/components/ui/ListGroup';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';

export default function MoreScreen() {
  const { colors, sys, isDark } = useTheme();
  const user = useAuthStore((s) => s.user);
  const { setTheme } = useUIStore();
  const currency = user?.currency ?? 'IDR';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle title="More" back="Summary" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ListGroup>
          <Pressable
            onPress={() => router.push('/profile')}
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            style={({ pressed }) => [styles.profile, pressed && { backgroundColor: colors.pressed }]}
          >
            <View style={[styles.avatar, { backgroundColor: sys.blue }]}>
              <Text style={styles.avatarText}>{(user?.name ?? 'M').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[Type.title3, { color: colors.text }]} numberOfLines={1}>{user?.name ?? 'My Account'}</Text>
              <Text style={[Type.footnote, { color: colors.textSecondary }]}>Local Account · {currency}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Pressable>
        </ListGroup>

        <ListGroup separatorInset={ROW_ICON_INSET}>
          <ListRow icon="pricetags" iconColor={sys.orange} title="Categories" onPress={() => router.push('/categories')} />
        </ListGroup>

        <ListGroup separatorInset={ROW_ICON_INSET}>
          <ListRow
            icon="moon"
            iconColor={sys.indigo}
            title="Dark Mode"
            right={
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ false: colors.track, true: sys.green }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Dark Mode"
              />
            }
          />
          <ListRow icon="cash" iconColor={sys.indigo} title="Currency" value={currency} onPress={() => router.push('/settings/currency')} />
          <ListRow icon="globe" iconColor={sys.teal} title="Language" value="English" onPress={() => router.push('/settings/language')} />
          <ListRow icon="lock-closed" iconColor={sys.gray} title="Privacy & Security" onPress={() => router.push('/settings/privacy')} />
        </ListGroup>

        <ListGroup separatorInset={ROW_ICON_INSET}>
          <ListRow icon="share" iconColor={sys.blue} title="Export Data" value="CSV, Excel, PDF" onPress={() => router.push('/settings/export')} />
          <ListRow icon="download" iconColor={sys.green} title="Import Data" onPress={() => router.push('/settings/import')} />
        </ListGroup>
        <Text style={[Type.footnote, { color: colors.textSecondary, textAlign: 'center' }]}>
          ExpenseFlow v1.0.0 · Everything stays on this phone
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.xl, paddingTop: Space.sm, paddingBottom: Space.xxl },
  profile: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg, paddingVertical: Space.md, gap: Space.md },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Type.headline, color: '#FFFFFF' },
  profileInfo: { flex: 1 },
});
