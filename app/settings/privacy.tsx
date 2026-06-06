import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Switch, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';

export default function PrivacySettingsScreen() {
  const { colors } = useTheme();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SECURITY</Text>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="fingerprint"
            iconColor="#7C3AED"
            label="Biometric Lock"
            description="Use fingerprint or face ID to unlock"
            value={biometricLock}
            onToggle={() => toggle(biometricLock, setBiometricLock, 'Biometric lock')}
            colors={colors}
          />
          <Divider />
          <SettingRow
            icon="eye-off-outline"
            iconColor="#EC4899"
            label="Hide Amounts"
            description="Blur financial amounts on the dashboard"
            value={hideAmounts}
            onToggle={() => toggle(hideAmounts, setHideAmounts, 'Amount hiding')}
            colors={colors}
          />
          <Divider />
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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SettingRow
            icon="chart-bar"
            iconColor="#3B82F6"
            label="Usage Analytics"
            description="Help improve ExpenseFlow with anonymous usage data"
            value={analyticsEnabled}
            onToggle={() => toggle(analyticsEnabled, setAnalyticsEnabled, 'Analytics')}
            colors={colors}
          />
          <Divider />
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
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.linkRow}>
            <MaterialCommunityIcons name="shield-outline" size={20} color={Colors.primary.main} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>Privacy Policy</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.linkRow}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color={Colors.primary.main} />
            <Text style={[styles.linkLabel, { color: colors.text }]}>Terms of Service</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={styles.linkRow}>
            <MaterialCommunityIcons name="delete-outline" size={20} color={Colors.error.main} />
            <Text style={[styles.linkLabel, { color: Colors.error.main }]}>Delete My Data</Text>
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
      <Switch value={value} onValueChange={onToggle} color={Colors.primary.main} />
    </View>
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
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 8, marginLeft: 4 },
  section: { borderRadius: 12, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingDesc: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
});
