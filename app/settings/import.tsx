import React, { useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/Button';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow } from '@/shared/components/ui/ListGroup';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { getTransactionById, insertTransaction, updateTransaction } from '@/services/database/repositories/transactionRepository';
import { loadCategoryMemory } from '@/features/import/categoryMemory';
import { parseBcaStatement, ParsedTx } from '@/features/import/bcaStatement';
import { PdfTextReader, PdfTextReaderHandle } from '@/features/import/PdfTextReader';
import type { Transaction } from '@/types/models';

// Categories an earlier import fell back to; rows still there can be re-sorted safely.
const STILL_UNSORTED = ['cat_expense_other', 'cat_income_other'];

type ImportStep = 'select' | 'reading' | 'preview' | 'importing' | 'done';

interface Preview {
  files: string[];
  fresh: ParsedTx[]; // not in the app yet
  fixes: { parsed: ParsedTx; existing: Transaction }[]; // imported earlier, still in "Other", now sortable
  already: number;
}

export default function ImportScreen() {
  const { colors, sys } = useTheme();
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
      const memory = await loadCategoryMemory();
      for (const file of picked.assets) {
        const base64 = await readAsStringAsync(file.uri, { encoding: EncodingType.Base64 });
        const lines = await reader.current!.read(base64);
        if (!lines.some((l) => /MUTASI REKENING/.test(l))) {
          throw new Error(`${file.name} isn't a BCA Mutasi Rekening statement.`);
        }
        const parsed = parseBcaStatement(lines, memory);
        parsed.transactions.forEach((t) => byId.set(t.id, t)); // overlapping statements count once
      }
      const all = [...byId.values()];
      const exists = await Promise.all(all.map((t) => getTransactionById(t.id)));
      setPreview({
        files: picked.assets.map((a) => a.name),
        fresh: all.filter((_, i) => !exists[i]),
        fixes: all
          .map((parsed, i) => ({ parsed, existing: exists[i]! }))
          .filter(({ parsed, existing }) =>
            existing && STILL_UNSORTED.includes(existing.categoryId) && existing.categoryId !== parsed.categoryId),
        already: exists.filter(Boolean).length,
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
    // Rows from an earlier import that never left "Other" get the better guess now.
    for (const { parsed, existing } of preview.fixes) {
      await updateTransaction(existing.id, {
        categoryId: parsed.categoryId,
        type: parsed.type,
        amount: parsed.amount,
        notes: existing.notes,
        attachmentUrl: existing.attachmentUrl,
        attachmentPath: existing.attachmentPath,
      });
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['transactions'] }),
      queryClient.invalidateQueries({ queryKey: ['monthly-stats'] }),
    ]);
    setImported(preview.fresh.length);
    setStep('done');
    showSnackbar(
      `${preview.fresh.length} imported${preview.fixes.length ? `, ${preview.fixes.length} re-sorted` : ''}`,
      'success',
    );
  };

  const handleReset = () => {
    setStep('select');
    setPreview(null);
  };

  const fresh = preview?.fresh ?? [];
  const total = (pick: (t: ParsedTx) => boolean) => fresh.filter(pick).reduce((s, t) => s + Math.abs(t.amount), 0);
  const unsorted = fresh.filter((t) => STILL_UNSORTED.includes(t.categoryId)).length;
  const dates = (preview?.fresh ?? []).map((t) => t.date).sort();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle back title="Import Data" />

      {Platform.OS !== 'web' && <PdfTextReader ref={reader} />}

      <ScrollView contentContainerStyle={styles.content}>
        {step === 'select' && (
          <>
            <View style={[styles.card, { backgroundColor: colors.surface }]}>
              <View style={[styles.tile, { backgroundColor: sys.red }]}>
                <Ionicons name="document-text" size={44} color="#FFFFFF" />
              </View>
              <Text style={[Type.title3, styles.center, { color: colors.text }]}>Import BCA statements</Text>
              <Text style={[Type.body, styles.center, { color: colors.textSecondary }]}>
                Pick one or more Mutasi Rekening PDFs from myBCA
              </Text>
              <Button onPress={handlePickFile} fullWidth size="large" style={styles.pickBtn}>
                Choose PDFs
              </Button>
            </View>

            <ListGroup header="How it works">
              {HOW_IT_WORKS.map((req) => (
                <View key={req} style={styles.requirementRow}>
                  <Ionicons name="checkmark-circle" size={20} color={sys.green} />
                  <Text style={[styles.requirementText, { color: colors.text }]}>{req}</Text>
                </View>
              ))}
            </ListGroup>
          </>
        )}

        {(step === 'reading' || step === 'importing') && (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.textSecondary} />
            <Text style={[Type.title, { color: colors.text }]}>
              {step === 'reading' ? 'Reading your statements…' : 'Importing transactions…'}
            </Text>
            <Text style={[Type.footnote, styles.center, { color: colors.textSecondary }]}>
              Everything stays on this phone.
            </Text>
          </View>
        )}

        {step === 'preview' && preview && (
          <>
            <ListGroup
              header={preview.files.length === 1 ? preview.files[0] : `${preview.files.length} statements`}
              footer={
                unsorted
                  ? `${unsorted} will land in "Other". Change one in the app and every transaction with the same name follows, now and on future imports.`
                  : preview.fresh.length || preview.fixes.length ? 'Ready to import.' : 'Nothing new to import.'
              }
            >
              <ListRow title="New transactions" value={String(preview.fresh.length)} />
              {dates.length > 0 && <ListRow title="Dates" value={`${dates[0]} – ${dates[dates.length - 1]}`} />}
              <ListRow title="Spending" value={formatCurrency(total((t) => t.amount > 0 && t.type === 'expense'), currency)} />
              <ListRow title="Paid back by friends" value={formatCurrency(total((t) => t.categoryId === 'cat_payback'), currency)} />
              <ListRow title="Income" value={formatCurrency(total((t) => t.type === 'income'), currency)} />
              <ListRow title="Already in the app" value={String(preview.already)} />
              {preview.fixes.length > 0 && <ListRow title="Re-sort from Other" value={String(preview.fixes.length)} />}
            </ListGroup>

            <View style={styles.actions}>
              <Button onPress={handleImport} fullWidth size="large" disabled={!preview.fresh.length && !preview.fixes.length}>
                Import
              </Button>
              <Button variant="text" onPress={handleReset} fullWidth size="large">
                Cancel
              </Button>
            </View>
          </>
        )}

        {step === 'done' && (
          <View style={styles.centerState}>
            <View style={[styles.tile, { backgroundColor: sys.green }]}>
              <Ionicons name="checkmark" size={48} color="#FFFFFF" />
            </View>
            <Text style={[Type.title3, { color: colors.text }]}>Import complete</Text>
            <Text style={[Type.body, styles.center, { color: colors.textSecondary }]}>
              {imported} transactions added. They're tagged "BCA import" so you can find them.
            </Text>
            <View style={styles.actions}>
              <Button onPress={() => router.back()} fullWidth size="large">
                Done
              </Button>
              <Button onPress={handleReset} variant="text" fullWidth size="large">
                Import Another
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const HOW_IT_WORKS = [
  'In myBCA, open Mutasi Rekening, pick a period and save it as PDF',
  'The PDF is read on this phone and never uploaded',
  'Account and reference numbers are dropped; only date, name and amount are kept',
  'Money in from your own other account counts as salary; money out to it counts as housing',
  'Friends paying you back lower your spending instead of counting as income',
  'Importing the same period twice adds nothing twice',
];

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.xl, paddingTop: Space.md, paddingBottom: Space.xxl },
  center: { textAlign: 'center' },
  card: { marginHorizontal: Space.lg, borderRadius: Radius.lg, padding: Space.xl, alignItems: 'center', gap: Space.sm },
  tile: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Space.sm },
  pickBtn: { marginTop: Space.md },
  requirementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.md, paddingHorizontal: Space.lg, paddingVertical: 11 },
  requirementText: { ...Type.body, flex: 1 },
  actions: { alignSelf: 'stretch', paddingHorizontal: Space.lg, gap: Space.xs },
  centerState: { alignItems: 'center', gap: Space.md, paddingTop: Space.xxl, paddingHorizontal: Space.lg },
});
