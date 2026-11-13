import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { LargeTitle } from '@/shared/components/ui/LargeTitle';
import { ListGroup, ListRow } from '@/shared/components/ui/ListGroup';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { CURRENCIES } from '@/shared/constants/currencies';

const USER_PROFILE_KEY = 'local_user_profile';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { colors, sys, accent } = useTheme();
  const { user, updateUser } = useAuthStore();
  const { showSnackbar } = useUIStore();

  const { control, handleSubmit, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      currency: user?.currency ?? 'IDR',
    },
  });

  const saveProfile = async (data: ProfileForm) => {
    const updates = { name: data.name, currency: data.currency, updatedAt: new Date().toISOString() };
    updateUser(updates);
    const updated = { ...user, ...updates };
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    showSnackbar('Profile saved', 'success');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your transactions, budgets, and categories. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            showSnackbar('All data cleared', 'success');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle back title="Profile" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: sys.blue }]}>
            <Text style={styles.avatarText}>{(user?.name ?? 'M').charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={[Type.headline, { color: colors.text }]}>{user?.name ?? 'My Account'}</Text>
          <Text style={[Type.footnote, { color: colors.textSecondary }]}>Local Account</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input label="Display Name" value={value} onChangeText={onChange} error={errors.name?.message} />
            )}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CURRENCY</Text>
          <Controller
            control={control}
            name="currency"
            render={({ field: { onChange, value } }) => (
              <View style={styles.currencyGrid}>
                {CURRENCIES.map((c) => {
                  const selected = value === c.code;
                  return (
                    <Pressable
                      key={c.code}
                      style={({ pressed }) => [
                        styles.currencyChip,
                        { backgroundColor: selected ? accent : colors.surfaceAlt, opacity: pressed ? 0.6 : 1 },
                      ]}
                      onPress={() => onChange(c.code)}
                      accessibilityRole="button"
                      accessibilityLabel={`${c.code} ${c.symbol}`}
                      accessibilityState={{ selected }}
                    >
                      <Text style={[styles.currencyCode, { color: selected ? '#FFFFFF' : colors.text }]}>
                        {c.code} {c.symbol}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          />

          <Button onPress={handleSubmit(saveProfile)} disabled={!isDirty} fullWidth size="large">
            Save Changes
          </Button>
        </View>

        <ListGroup footer="Permanently delete all local data including transactions, budgets, and settings.">
          <ListRow title="Clear All Data" destructive onPress={handleClearData} chevron={false} />
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: Space.xl, paddingTop: Space.md, paddingBottom: Space.xxl },
  avatarSection: { alignItems: 'center', gap: Space.xs },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: Space.sm },
  avatarText: { fontSize: 38, lineHeight: 44, fontWeight: '600', color: '#FFFFFF' },
  form: { paddingHorizontal: Space.lg, gap: Space.md },
  fieldLabel: { ...Type.footnote, paddingHorizontal: Space.lg, marginBottom: -Space.xs },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginBottom: Space.sm },
  currencyChip: { paddingHorizontal: Space.md + 2, minHeight: 36, justifyContent: 'center', borderRadius: Radius.pill },
  currencyCode: { ...Type.body, fontWeight: '600' },
});
