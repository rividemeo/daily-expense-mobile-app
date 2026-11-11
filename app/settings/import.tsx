import React, { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '@/shared/constants/colors';
import { Button } from '@/shared/components/ui/Button';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getTransactionById, insertTransaction } from '@/services/database/repositories/transactionRepository';
import { parseBcaStatement, ParsedTx } from '@/features/import/bcaStatement';
import { PdfTextReader, PdfTextReaderHandle } from '@/features/import/PdfTextReader';
import type { Transaction } from '@/types/models';

type ImportStep = 'select' | 'reading' | 'preview' | 'importing' | 'done';

interface Preview {
  files: string[];
  fresh: ParsedTx[]; // not in the app yet
  already: number;
  ownTransfers: number;
}

export default function ImportScreen() {
  const { colors, accent, isDark } = useTheme();
  const tint = isDark ? 'rgba(45,212,191,0.12)' : Colors.primary[50];
  const okBg = isDark ? 'rgba(74,222,128,0.12)' : Colors.success.background;
  const ok = isDark ? Colors.success.light : Colors.success.main;
  const { showSnackbar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const addToStore = useTransactionStore((s) => s.addTransaction);
  const queryClient = useQueryClient();
  const reader = useRef<PdfTextReaderHandle>(null);

  const [step, setStep] = useState<ImportStep>('select');
  const [preview, setPreview] = useState<Preview | null>(null);
  const [imported, setImported] = useState(0);
  const currency = user?.currency ?? 'IDR';

  const handlePickFile = async () => {
    if (Platform.OS === 'web') {
      showSnackbar('Importing PDFs works in the Android app', 'info');
      return;
    }
    const picked = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (picked.canceled || !picked.assets.length) return;

    setStep('reading');
    try {
      const byId = new Map<string, ParsedTx>();
      let ownTransfers = 0;
      for (const file of picked.assets) {
        const base64 = await readAsStringAsync(file.uri, { encoding: EncodingType.Base64 });
        const lines = await reader.current!.read(base64);
        if (!lines.some((l) => /MUTASI REKENING/.test(l))) {
          throw new Error(`${file.name} isn't a BCA Mutasi Rekening statement.`);
        }
        const parsed = parseBcaStatement(lines);
        parsed.transactions.forEach((t) => byId.set(t.id, t)); // overlapping statements count once
        ownTransfers += parsed.skippedOwnTransfers;
      }
      const all = [...byId.values()];
      const exists = await Promise.all(all.map((t) => getTransactionById(t.id)));
      setPreview({
        files: picked.assets.map((a) => a.name),
        fresh: all.filter((_, i) => !exists[i]),
        already: exists.filter(Boolean).length,
        ownTransfers,
      });
      setStep('preview');
    } catch (e) {
      showSnackbar(e instanceof Error ? e.message : "Couldn't read that PDF", 'error');
      setStep('select');
    }
  };

  const handleImport = async () => {
    if (!preview || !user) return;
    setStep('importing');
    const now = new Date().toISOString();
    for (const t of preview.fresh) {
      const tx: Transaction = {
        ...t,
        tags: ['BCA import'],
        isRecurring: false,
        userId: user.id,
        isSynced: false,
        createdAt: now,
        updatedAt: now,
      };
      await insertTransaction(tx);
      addToStore(tx);
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] }),
    ]);
    setImported(preview.fresh.length);
    setStep('done');
    showSnackbar(`${preview.fresh.length} transactions imported`, 'success');
  };

  const handleReset = () => {
    setStep('select');
    setPreview(null);
  };

  const sum = (type: 'income' | 'expense') =>
    (preview?.fresh ?? []).filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const dates = (preview?.fresh ?? []).map((t) => t.date).sort();

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

      {Platform.OS !== 'web' && <PdfTextReader ref={reader} />}

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'select' && (
          <>
            <View style={[styles.uploadArea, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <View style={[styles.uploadIcon, { backgroundColor: tint }]}>
                <MaterialCommunityIcons name="file-pdf-box" size={48} color={accent} />
              </View>
              <Text style={[styles.uploadTitle, { color: colors.text }]}>Import BCA statements</Text>
              <Text style={[styles.uploadSubtitle, { color: colors.textSecondary }]}>
                Pick one or more Mutasi Rekening PDFs from myBCA
              </Text>
              <Button onPress={handlePickFile} icon="folder-open" style={styles.pickBtn}>
                Choose PDFs
              </Button>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HOW IT WORKS</Text>
            <View style={[styles.requirementsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {HOW_IT_WORKS.map((req) => (
                <View key={req} style={styles.requirementRow}>
                  <MaterialCommunityIcons name="check-circle-outline" size={16} color={ok} />
                  <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {(step === 'reading' || step === 'importing') && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={[styles.stateTitle, { color: colors.text }]}>
              {step === 'reading' ? 'Reading your statements…' : 'Importing transactions…'}
            </Text>
            <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
              Everything stays on this phone.
            </Text>
          </View>
        )}

        {step === 'preview' && preview && (
          <>
            <View style={[styles.fileCard, { backgroundColor: okBg }]}>
              <MaterialCommunityIcons name="file-check" size={32} color={ok} />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                  {preview.files.length === 1 ? preview.files[0] : `${preview.files.length} statements`}
                </Text>
                <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
                  {preview.fresh.length ? 'Ready to import' : 'Nothing new to import'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.closeBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove files"
              >
                <MaterialCommunityIcons name="close-circle" size={22} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.previewInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <PreviewRow label="New transactions" value={String(preview.fresh.length)} colors={colors} />
              {dates.length > 0 && (
                <PreviewRow label="Dates" value={`${dates[0]} – ${dates[dates.length - 1]}`} colors={colors} />
              )}
              <PreviewRow label="Money out" value={formatCurrency(sum('expense'), currency)} colors={colors} />
              <PreviewRow label="Money in" value={formatCurrency(sum('income'), currency)} colors={colors} />
              <PreviewRow label="Already in the app" value={String(preview.already)} colors={colors} />
              <PreviewRow
                label="Between your own accounts (skipped)"
                value={String(preview.ownTransfers)}
                colors={colors}
              />
            </View>

            <View style={styles.actions}>
              <Button variant="outlined" onPress={handleReset} style={styles.actionBtn}>
                Cancel
              </Button>
              <Button
                onPress={handleImport}
                style={styles.actionBtn}
                color="success"
                disabled={!preview.fresh.length}
              >
                Import
              </Button>
            </View>
          </>
        )}

        {step === 'done' && (
          <View style={styles.centerState}>
            <View style={[styles.successIcon, { backgroundColor: okBg }]}>
              <MaterialCommunityIcons name="check-bold" size={40} color={ok} />
            </View>
            <Text style={[styles.stateTitle, { color: colors.text }]}>Import complete</Text>
            <Text style={[styles.stateSubtitle, { color: colors.textSecondary }]}>
              {imported} transactions added. They're tagged "BCA import" so you can find them.
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

const HOW_IT_WORKS = [
  'In myBCA, open Mutasi Rekening, pick a period and save it as PDF',
  'The PDF is read on this phone and never uploaded',
  'Account and reference numbers are dropped; only date, name and amount are kept',
  'Transfers between your own accounts are skipped',
  'Importing the same period twice adds nothing twice',
];

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
