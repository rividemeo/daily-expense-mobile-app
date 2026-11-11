import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/shared/constants/colors';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { CURRENCIES } from '@/shared/constants/currencies';

const USER_PROFILE_KEY = 'local_user_profile';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  currency: z.string(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { colors, accent, isDark } = useTheme();
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <Avatar.Text
            size={80}
            label={(user?.name ?? 'M').charAt(0).toUpperCase()}
            style={{ backgroundColor: Colors.primary.main }}
          />
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name ?? 'My Account'}</Text>
          <Text style={[styles.badge, { backgroundColor: isDark ? 'rgba(45,212,191,0.12)' : Colors.primary[50], color: accent }]}>
            Local Account
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input
                label="Display Name"
                value={value}
                onChangeText={onChange}
                leftIcon="account-outline"
                error={errors.name?.message}
              />
            )}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Currency</Text>
          <Controller
            control={control}
            name="currency"
            render={({ field: { onChange, value } }) => (
              <View style={styles.currencyGrid}>
                {CURRENCIES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.currencyChip,
                      { backgroundColor: colors.surface, borderColor: value === c.code ? accent : colors.border },
                    ]}
                    onPress={() => onChange(c.code)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: value === c.code }}
                  >
                    <Text style={[styles.currencyCode, { color: value === c.code ? accent : colors.text }]}>
                      {c.code}
                    </Text>
                    <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>{c.symbol}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />

          <Button
            onPress={handleSubmit(saveProfile)}
            disabled={!isDirty}
            fullWidth
            size="large"
          >
            Save Changes
          </Button>
        </View>

        <View style={[styles.dangerSection, { backgroundColor: isDark ? 'rgba(248,113,113,0.12)' : Colors.error.background }]}>
          <Text style={[styles.dangerTitle, { color: isDark ? Colors.error.light : Colors.error.main }]}>Danger Zone</Text>
          <Text style={[styles.dangerDesc, { color: colors.textSecondary }]}>
            Permanently delete all local data including transactions, budgets, and settings.
          </Text>
          <Button onPress={handleClearData} variant="outlined" color="error" fullWidth>
            Clear All Data
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Space.lg, paddingVertical: Space.md },
  backBtn: { width: TOUCH, height: TOUCH, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  title: { ...Type.title },
  content: { padding: Space.lg, gap: Space.xl, paddingBottom: Space.xxl },
  avatarSection: { alignItems: 'center', gap: Space.sm },
  userName: { ...Type.headline },
  badge: { ...Type.caption, fontWeight: '600', paddingHorizontal: Space.md, paddingVertical: 3, borderRadius: Radius.pill, overflow: 'hidden' },
  form: { gap: Space.lg },
  fieldLabel: { ...Type.body, fontWeight: '600' },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  currencyChip: { paddingHorizontal: Space.md, paddingVertical: Space.sm, minHeight: TOUCH, justifyContent: 'center', borderRadius: Radius.md, borderWidth: 1.5, alignItems: 'center', minWidth: 64 },
  currencyCode: { ...Type.body, fontWeight: '600' },
  currencySymbol: { ...Type.caption },
  dangerSection: { borderRadius: Radius.lg, padding: Space.lg, gap: Space.md },
  dangerTitle: { ...Type.body, fontWeight: '600' },
  dangerDesc: { ...Type.body },
});
