import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/shared/constants/colors';
import { Button } from '@/shared/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';

type ImportStep = 'select' | 'preview' | 'importing' | 'done';

export default function ImportScreen() {
  const { colors, accent, isDark } = useTheme();
  const tint = isDark ? 'rgba(45,212,191,0.12)' : Colors.primary[50];
  const okBg = isDark ? 'rgba(74,222,128,0.12)' : Colors.success.background;
  const ok = isDark ? Colors.success.light : Colors.success.main;
  const { showSnackbar } = useUIStore();

  const [step, setStep] = useState<ImportStep>('select');
  const [fileName, setFileName] = useState<string | null>(null);

  const handlePickFile = async () => {
    // expo-document-picker integration point
    // For now, simulate a file selection with a mock filename
    setFileName('transactions_export_2024.csv');
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    await new Promise((r) => setTimeout(r, 2000));
    setStep('done');
    showSnackbar('Import completed successfully', 'success');
  };

  const handleReset = () => {
    setStep('select');
    setFileName(null);
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
        <Text style={[styles.title, { color: colors.text }]}>Import Data</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'select' && (
          <>
            <View style={[styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.uploadIcon, { backgroundColor: tint }]}>
                <MaterialCommunityIcons name="file-upload-outline" size={48} color={accent} />
              </View>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>Select a file to import</Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                Supported formats: CSV, Excel (.xlsx)
              </Text>
              <Button onPress={handlePickFile} icon="folder-open" style={styles.pickBtn}>
                Browse Files
              </Button>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>REQUIREMENTS</Text>
            <View style={[styles.requirementsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {REQUIREMENTS.map((req) => (
                <View key={req} style={styles.requirementRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={ok} />
                  <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CSV TEMPLATE</Text>
            <View style={[styles.templateCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.templateLabel, { color: colors.textSecondary }]}>Required columns:</Text>
              <View style={styles.columns}>
                {CSV_COLUMNS.map((col) => (
                  <View key={col} style={[styles.columnTag, { backgroundColor: tint }]}>
                    <Text style={[styles.columnText, { color: accent }]}>{col}</Text>
                  </View>
                ))}
              </View>
              <Button variant="outlined" icon="download" style={styles.templateBtn} onPress={() => {}}>
                Download Template
              </Button>
            </View>
          </>
        )}

        {step === 'preview' && fileName && (
          <>
            <View style={[styles.fileCard, { backgroundColor: okBg }]}>
              <MaterialCommunityIcons name="file-check" size={32} color={ok} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: colors.text }]}>{fileName}</Text>
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>Ready to import</Text>
              </View>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove file"
              >
                <MaterialCommunityIcons name="close-circle" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.previewInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <PreviewRow label="Estimated rows" value="42 transactions" colors={colors} />
              <PreviewRow label="Date range" value="Jan 2024 – Dec 2024" colors={colors} />
              <PreviewRow label="Duplicates" value="None detected" colors={colors} />
            </View>

            <View style={styles.actions}>
              <Button variant="outlined" onPress={handleReset} style={styles.actionBtn}>
                Cancel
              </Button>
              <Button onPress={handleImport} style={styles.actionBtn} color="success">
                Import Now
              </Button>
            </View>
          </>
        )}

        {step === 'importing' && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>Importing transactions...</Text>
            <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
              Please wait while we process your file.
            </Text>
          </View>
        )}

        {step === 'done' && (
          <View style={styles.centerState}>
            <View style={[styles.successIcon, { backgroundColor: okBg }]}>
              <MaterialCommunityIcons name="check-bold" size={40} color={ok} />
            </View>
            <Text style={[styles.stateTitle, { color: colors.text }]}>Import Complete!</Text>
            <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
              Your transactions have been imported successfully.
            </Text>
            <View style={styles.doneActions}>
              <Button onPress={handleReset} variant="outlined" style={styles.doneBtn}>
                Import Another
              </Button>
              <Button onPress={() => router.back()} style={styles.doneBtn}>
                Done
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PreviewRow({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.previewRow, { borderBottomColor: colors.divider }]}>
      <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.previewValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const REQUIREMENTS = [
  'File must be in CSV or Excel format',
  'First row must be column headers',
  'Dates in YYYY-MM-DD format',
  'Amounts as plain numbers (no currency symbols)',
  'Maximum 10,000 rows per import',
];

const CSV_COLUMNS = ['date', 'amount', 'type', 'category', 'description', 'notes', 'payment_method', 'tags'];

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
  content: { padding: Space.lg, gap: Space.lg, paddingBottom: Space.xxl },
  uploadArea: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: Space.xxl,
    alignItems: 'center',
    gap: Space.sm,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.sm,
  },
  uploadTitle: { ...Type.bodyLg, fontWeight: '600' },
  uploadSubtitle: { ...Type.body, textAlign: 'center' },
  pickBtn: { marginTop: Space.sm },
  sectionLabel: { ...Type.caption, fontWeight: '600', letterSpacing: 1, marginLeft: Space.xs, marginBottom: -Space.sm },
  requirementsCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Space.lg, gap: Space.md },
  requirementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.sm },
  requirementText: { ...Type.body, flex: 1 },
  templateCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Space.lg, gap: Space.md },
  templateLabel: { ...Type.body, fontWeight: '500' },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  columnTag: { borderRadius: Radius.sm, paddingHorizontal: Space.sm, paddingVertical: Space.xs },
  columnText: { ...Type.caption, fontWeight: '500', fontFamily: 'monospace' },
  templateBtn: { marginTop: Space.xs },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.lg,
    borderRadius: Radius.lg,
    gap: Space.md,
  },
  fileInfo: { flex: 1 },
  fileName: { ...Type.body, fontWeight: '600' },
  fileSize: { ...Type.caption, marginTop: 2 },
  closeBtn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  previewInfo: { borderRadius: Radius.lg, borderWidth: 1, overflow: 'hidden' },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: TOUCH,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderBottomWidth: 1,
  },
  previewLabel: { ...Type.body },
  previewValue: { ...Type.body, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: Space.md },
  actionBtn: { flex: 1 },
  centerState: { alignItems: 'center', gap: Space.md, paddingTop: Space.xxl },
  stateTitle: { ...Type.title },
  stateSubtitle: { ...Type.body, textAlign: 'center' },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneActions: { flexDirection: 'row', gap: Space.md, marginTop: Space.sm },
  doneBtn: { flex: 1 },
});
