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

type ImportStep = 'select' | 'preview' | 'importing' | 'done';

export default function ImportScreen() {
  const { colors } = useTheme();
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Import Data</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'select' && (
          <>
            <View style={[styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={styles.uploadIcon}>
                <MaterialCommunityIcons name="file-upload-outline" size={48} color={Colors.primary.main} />
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
            <View style={[styles.requirementsCard, { backgroundColor: colors.surface }]}>
              {REQUIREMENTS.map((req) => (
                <View key={req} style={styles.requirementRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={Colors.success.main} />
                  <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                </View>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CSV TEMPLATE</Text>
            <View style={[styles.templateCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.templateLabel, { color: colors.textSecondary }]}>Required columns:</Text>
              <View style={styles.columns}>
                {CSV_COLUMNS.map((col) => (
                  <View key={col} style={[styles.columnTag, { backgroundColor: Colors.primary[50] }]}>
                    <Text style={[styles.columnText, { color: Colors.primary.main }]}>{col}</Text>
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
            <View style={[styles.fileCard, { backgroundColor: Colors.success.background }]}>
              <MaterialCommunityIcons name="file-check" size={32} color={Colors.success.main} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: colors.text }]}>{fileName}</Text>
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>Ready to import</Text>
              </View>
              <TouchableOpacity onPress={handleReset}>
                <MaterialCommunityIcons name="close-circle" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.previewInfo, { backgroundColor: colors.surface }]}>
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
            <ActivityIndicator size="large" color={Colors.primary.main} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>Importing transactions...</Text>
            <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
              Please wait while we process your file.
            </Text>
          </View>
        )}

        {step === 'done' && (
          <View style={styles.centerState}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-bold" size={40} color={Colors.success.main} />
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
    <View style={styles.previewRow}>
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
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  uploadArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitle: { fontSize: 17, fontWeight: '600' },
  uploadSubtitle: { fontSize: 13, textAlign: 'center' },
  pickBtn: { marginTop: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginLeft: 4, marginBottom: -8 },
  requirementsCard: { borderRadius: 12, padding: 16, gap: 10 },
  requirementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  requirementText: { fontSize: 13, flex: 1, lineHeight: 18 },
  templateCard: { borderRadius: 12, padding: 16, gap: 12 },
  templateLabel: { fontSize: 13, fontWeight: '500' },
  columns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  columnTag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  columnText: { fontSize: 12, fontWeight: '500', fontFamily: 'monospace' },
  templateBtn: { marginTop: 4 },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 15, fontWeight: '600' },
  fileSize: { fontSize: 12, marginTop: 2 },
  previewInfo: { borderRadius: 12, overflow: 'hidden' },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey[100],
  },
  previewLabel: { fontSize: 14 },
  previewValue: { fontSize: 14, fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1 },
  centerState: { alignItems: 'center', gap: 12, paddingTop: 40 },
  stateTitle: { fontSize: 20, fontWeight: '700' },
  stateSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  doneBtn: { flex: 1 },
});
