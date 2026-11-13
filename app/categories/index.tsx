import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Pressable, TextInput, Alert } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '@/shared/constants/colors';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { LargeTitle, HeaderButton } from '@/shared/components/ui/LargeTitle';
import { ListGroup } from '@/shared/components/ui/ListGroup';
import { SegmentedControl } from '@/shared/components/ui/SegmentedControl';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/hooks/useTheme';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { CATEGORY_ICONS } from '@/shared/constants/categories';
import { Category, TransactionType } from '@/types/models';

const categorySchema = z.object({
  name: z.string().min(1, 'Name required').max(30),
  icon: z.string().min(1, 'Select an icon'),
  color: z.string().min(1, 'Select a color'),
});

type CategoryForm = z.infer<typeof categorySchema>;

// Separator starts under the name, past the 30pt icon.
const ICON_INSET = Space.lg + 30 + Space.md;

export default function CategoriesScreen() {
  const { colors, accent, sys } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { categories, addCategory, deleteCategory } = useCategoryStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(Colors.categoryColors[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);

  const filtered = categories.filter((c) => c.type === type);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '', icon: CATEGORY_ICONS[0], color: Colors.categoryColors[0] },
  });

  const close = () => {
    setModalVisible(false);
    reset();
  };

  const onSubmit = (data: CategoryForm) => {
    const now = new Date().toISOString();
    addCategory({
      id: `cat_${Date.now()}`,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type,
      isDefault: false,
      userId: user?.id,
      createdAt: now,
      updatedAt: now,
    });
    close();
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) {
      Alert.alert('Cannot Delete', 'Default categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete Category', `Delete "${cat.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LargeTitle back title="Categories" right={<HeaderButton icon="add" label="Add Category" onPress={() => setModalVisible(true)} />} />

      <SegmentedControl
        value={type}
        onChange={setType}
        options={[
          { value: 'expense', label: 'Expense' },
          { value: 'income', label: 'Income' },
        ]}
        style={styles.segment}
      />

      <ScrollView contentContainerStyle={styles.list}>
        <ListGroup separatorInset={ICON_INSET} footer="Long press a custom category to delete it.">
          {filtered.map((cat) => (
            <Pressable
              key={cat.id}
              onLongPress={() => handleDelete(cat)}
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              accessibilityHint="Long press to delete"
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}
            >
              <CategoryIcon icon={cat.icon} color={cat.color} size={30} />
              <Text style={[Type.bodyLg, styles.flex, { color: colors.text }]} numberOfLines={1}>
                {cat.name}
              </Text>
              {cat.isDefault && <Text style={[Type.bodyLg, { color: colors.textSecondary }]}>Default</Text>}
            </Pressable>
          ))}
        </ListGroup>
      </ScrollView>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={close}
          style={styles.sheetWrap}
          contentContainerStyle={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + Space.lg }]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.textTertiary }]} />
          <View style={styles.bar}>
            <Pressable onPress={close} style={styles.barBtn} accessibilityRole="button" accessibilityLabel="Cancel" hitSlop={8}>
              <Text style={[Type.bodyLg, { color: accent }]}>Cancel</Text>
            </Pressable>
            <Text style={[styles.barTitle, { color: colors.text }]}>New Category</Text>
            <Pressable
              onPress={handleSubmit(onSubmit)}
              style={[styles.barBtn, styles.barRight]}
              accessibilityRole="button"
              accessibilityLabel="Create Category"
              hitSlop={8}
            >
              <Text style={[Type.title, { color: accent }]}>Save</Text>
            </Pressable>
          </View>

          <View style={styles.sheetBody}>
            <View>
              <ListGroup>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      value={value}
                      onChangeText={onChange}
                      placeholder="Category Name"
                      placeholderTextColor={colors.textTertiary}
                      accessibilityLabel="Category Name"
                      maxLength={30}
                      style={[Type.bodyLg, styles.input, { color: colors.text }]}
                    />
                  )}
                />
              </ListGroup>
              {errors.name ? <Text style={[styles.error, { color: sys.red }]}>{errors.name.message}</Text> : null}
            </View>

            <ListGroup header="Color">
              <View style={styles.grid}>
                {Colors.categoryColors.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.ring, { borderColor: selectedColor === c ? colors.textTertiary : 'transparent' }]}
                    onPress={() => { setSelectedColor(c); setValue('color', c); }}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel={`Colour ${c}`}
                    accessibilityState={{ selected: selectedColor === c }}
                  >
                    <View style={[styles.dot, { backgroundColor: c }]} />
                  </Pressable>
                ))}
              </View>
            </ListGroup>

            <ListGroup header="Icon">
              <View style={styles.grid}>
                {CATEGORY_ICONS.slice(0, 20).map((icon) => {
                  const on = selectedIcon === icon;
                  return (
                    <Pressable
                      key={icon}
                      style={[styles.iconItem, { backgroundColor: on ? selectedColor : colors.surfaceAlt }]}
                      onPress={() => { setSelectedIcon(icon); setValue('icon', icon); }}
                      accessibilityRole="button"
                      accessibilityLabel={`Icon ${icon}`}
                      accessibilityState={{ selected: on }}
                    >
                      <MaterialCommunityIcons name={icon as any} size={22} color={on ? '#FFFFFF' : colors.textSecondary} />
                    </Pressable>
                  );
                })}
              </View>
            </ListGroup>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  segment: { marginHorizontal: Space.lg, marginVertical: Space.sm },
  list: { paddingTop: Space.md, paddingBottom: Space.xxl },
  row: { minHeight: TOUCH, flexDirection: 'row', alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg, paddingVertical: 7 },
  sheetWrap: { justifyContent: 'flex-end', marginBottom: 0 },
  sheet: { borderTopLeftRadius: 14, borderTopRightRadius: 14, elevation: 0, shadowOpacity: 0, justifyContent: 'flex-start' },
  grabber: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: 6, opacity: 0.5 },
  bar: { height: TOUCH + 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Space.lg },
  barBtn: { minWidth: 70, minHeight: TOUCH, justifyContent: 'center' },
  barRight: { alignItems: 'flex-end' },
  barTitle: { ...Type.title, flex: 1, textAlign: 'center' },
  sheetBody: { gap: Space.xl, paddingTop: Space.sm },
  input: { minHeight: TOUCH, paddingHorizontal: Space.lg, paddingVertical: 11 },
  error: { ...Type.footnote, marginHorizontal: Space.xxl, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Space.sm, padding: Space.md },
  ring: { padding: 2, borderWidth: 2.5, borderRadius: Radius.pill },
  dot: { width: 34, height: 34, borderRadius: Radius.pill },
  iconItem: { width: TOUCH, height: TOUCH, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
});
