import { Colors } from '@/shared/constants/colors';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow, ROW_ICON_INSET } from '@/shared/components/ui/ListGroup';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space } from '@/shared/constants/theme';

export default function PrivacySettingsScreen() {
  const { colors, sys } = useTheme();
  const { showSnackbar } = useUIStore();

  const [biometricLock, setBiometricLock] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [crashReports, setCrashReports] = useState(true);
  const [hideAmounts, setHideAmounts] = useState(false);
  const [screenshotProtection, setScreenshotProtection] = useState(false);

  const toggle = (current: boolean, setter: (v: boolean) => void, label: string) => {
    setter(!current);
    showSnackbar(`${label} ${!current ? 'enabled' : 'disabled'}`, 'success');
  };

  const sw = (value: boolean, onToggle: () => void, label: string) => (
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: colors.track, true: sys.green }}
      thumbColor="#FFFFFF"
      accessibilityLabel={label}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle back title="Privacy & Security" />
      <ScrollView contentContainerStyle={styles.content}>
        <ListGroup header="Security" separatorInset={ROW_ICON_INSET}>
          <ListRow
            icon="finger-print"
            iconColor={sys.purple}
            title="Biometric Lock"
            subtitle="Use fingerprint or face ID to unlock"
            right={sw(biometricLock, () => toggle(biometricLock, setBiometricLock, 'Biometric lock'), 'Biometric Lock')}
          />
          <ListRow
            icon="eye-off"
            iconColor={sys.pink}
            title="Hide Amounts"
            subtitle="Blur financial amounts on the dashboard"
            right={sw(hideAmounts, () => toggle(hideAmounts, setHideAmounts, 'Amount hiding'), 'Hide Amounts')}
          />
          <ListRow
            icon="camera"
            iconColor={sys.orange}
            title="Screenshot Protection"
            subtitle="Prevent screenshots of sensitive screens"
            right={sw(screenshotProtection, () => toggle(screenshotProtection, setScreenshotProtection, 'Screenshot protection'), 'Screenshot Protection')}
          />
        </ListGroup>

        <ListGroup header="Data & Privacy" separatorInset={ROW_ICON_INSET}>
          <ListRow
            icon="bar-chart"
            iconColor={Colors.brand.orange}
            title="Usage Analytics"
            subtitle="Help improve ExpenseFlow with anonymous usage data"
            right={sw(analyticsEnabled, () => toggle(analyticsEnabled, setAnalyticsEnabled, 'Analytics'), 'Usage Analytics')}
          />
          <ListRow
            icon="bug"
            iconColor={sys.green}
            title="Crash Reports"
            subtitle="Automatically send crash reports to help fix bugs"
            right={sw(crashReports, () => toggle(crashReports, setCrashReports, 'Crash reports'), 'Crash Reports')}
          />
        </ListGroup>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.xl, paddingTop: Space.md, paddingBottom: Space.xxl },
});
