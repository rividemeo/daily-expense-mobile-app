import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';

export default function PrivacySettingsScreen() {
  const { colors, accent, isDark } = useTheme();
  const danger = isDark ? Colors.error.light : Colors.error.main;
  const { showSnackbar } = useUIStore();

  const [biometricLock, setBiometricLock] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(false);

  const toggle = (
    current: boolean,
    setter: (v: boolean) => void,
    label: string
  ) => {
    setter(!current);
    showSnackbar(`${label} ${!current ? 'enabled' : 'disabled'}`, 'success');
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
        <Text style={[styles.title, { color: colors.text }]}>Privacy & Security</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SECURITY</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="fingerprint"
            iconColor="#7C3AED"
            label="Biometric Lock"
            description="Use fingerprint or face ID to unlock"
            value={biometricLock}
            onToggle={() => toggle(biometricLock, setBiometricLock, 'Biometric lock')}
            colors={colors}
          />
          <Divider style={{ backgroundColor: colors.divider }} />
          <SettingRow
            icon="eye-off-outline"
            iconColor="#EC4899"
            label="Hide Amounts"
            description="Blur financial amounts on the dashboard"
            value={hideAmounts}
            onToggle={() => toggle(hideAmounts, setHideAmounts, 'Amount hiding')}
            colors={colors}
          />
          <Divider style={{ backgroundColor: colors.divider }} />
          <SettingRow
            icon="camera-off-outline"
            iconColor="#F59E0B"
            label="Screenshot Protection"
            description="Prevent screenshots of sensitive screens"
            value={screenshotProtection}
            onToggle={() => toggle(screenshotProtection, setScreenshotProtection, 'Screenshot protection')}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA & PRIVACY</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <SettingRow
            icon="chart-bar"
            iconColor="#3B82F6"
            label="Usage Analytics"
            description="Help improve ExpenseFlow with anonymous usage data"
            value={analyticsEnabled}
            onToggle={() => toggle(analyticsEnabled, setAnalyticsEnabled, 'Analytics')}
            colors={colors}
          />
          <Divider style={{ backgroundColor: colors.divider }} />
          <SettingRow
            icon="bug-outline"
            iconColor="#10B981"
            label="Crash Reports"
            description="Automatically send crash reports to help fix bugs"
            value={crashReports}
            onToggle={() => toggle(crashReports, setCrashReports, 'Crash reports')}
            colors={colors}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LEGAL</Text>
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.linkRow} accessibilityRole="button">
            <MaterialCommunityIcons name="shield-outline" size={20} color={accent} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>Privacy Policy</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: colors.divider }} />
          <TouchableOpacity style={styles.linkRow} accessibilityRole="button">
            <MaterialCommunityIcons name="file-document-outline" size={20} color={accent} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>Terms of Service</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <Divider style={{ backgroundColor: colors.divider }} />
          <TouchableOpacity style={styles.linkRow} accessibilityRole="button">
            <MaterialCommunityIcons name="delete-outline" size={20} color={danger} />
            <Text style={[styles.linkLabel, { color: danger }]}>Delete My Data</Text>
            <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  iconColor,
  label,
  description,
  value,
  onToggle,
  colors,
}: {
  icon: string;
  iconColor: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: any;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.iconBox, { backgroundColor: iconColor + '18' }]}>
        <MaterialCommunityIcons name={icon as any} size={22} color={iconColor} />
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} color={Colors.primary.main} accessibilityLabel={label} />
    </View>
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
  content: { padding: Space.lg, gap: Space.sm, paddingBottom: Space.xxl },
  sectionLabel: { ...Type.caption, fontWeight: '600', letterSpacing: 1, marginTop: Space.sm, marginLeft: Space.xs },
  section: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { ...Type.body, fontWeight: '500' },
  settingDesc: { ...Type.caption, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    gap: Space.md,
  },
  linkLabel: { flex: 1, ...Type.body, fontWeight: '500' },
});
