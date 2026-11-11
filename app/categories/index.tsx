import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, SegmentedButtons, Portal, Modal, FAB } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Colors } from '@/shared/constants/colors';
import { CategoryIcon } from '@/shared/components/ui/CategoryIcon';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
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

export default function CategoriesScreen() {
  const { colors } = useTheme();
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
    setModalVisible(false);
    reset();
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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        <View style={{ width: TOUCH }} />
      </View>

      <View style={styles.typeToggle}>
        <SegmentedButtons
          value={type}
          onValueChange={(v) => setType(v as TransactionType)}
          buttons={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onLongPress={() => handleDelete(item)}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            accessibilityHint="Long press to delete"
          >
            <CategoryIcon icon={item.icon} color={item.color} size={52} />
            <Text style={[styles.catName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isDefault && (
              <Text style={[styles.defaultBadge, { color: colors.textTertiary }]}>Default</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <FAB
        icon="plus"
        label="Add Category"
        onPress={() => setModalVisible(true)}
        style={styles.fab}
      />

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => { setModalVisible(false); reset(); }}
          contentContainerStyle={[styles.modal, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.modalTitle, { color: colors.text }]}>New Category</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input label="Category Name" value={value} onChangeText={onChange} error={errors.name?.message} style={styles.field} />
            )}
          />

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color</Text>
          <View style={styles.colorRow}>
            {Colors.categoryColors.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && [styles.colorDotSelected, { borderColor: colors.text }]]}
                onPress={() => { setSelectedColor(c); setValue('color', c); }}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Colour ${c}`}
                accessibilityState={{ selected: selectedColor === c }}
              />
            ))}
          </View>

          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Icon</Text>
          <View style={styles.iconGrid}>
            {CATEGORY_ICONS.slice(0, 20).map((icon) => (
              <TouchableOpacity
                key={icon}
                style={[styles.iconItem, { borderColor: colors.border }, selectedIcon === icon && { backgroundColor: selectedColor + '22', borderColor: selectedColor }]}
                onPress={() => { setSelectedIcon(icon); setValue('icon', icon); }}
                accessibilityRole="button"
                accessibilityLabel={`Icon ${icon}`}
                accessibilityState={{ selected: selectedIcon === icon }}
              >
                <MaterialCommunityIcons name={icon as any} size={24} color={selectedIcon === icon ? selectedColor : colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>

          <Button onPress={handleSubmit(onSubmit)} fullWidth size="large" style={styles.field}>
            Create Category
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
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
  typeToggle: { paddingHorizontal: Space.lg, marginBottom: Space.lg },
  grid: { padding: Space.md, gap: Space.sm },
  catCard: {
    flex: 1,
    margin: Space.xs,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Space.lg,
    alignItems: 'center',
    gap: Space.sm,
    minHeight: 100,
  },
  catName: { ...Type.caption, fontWeight: '600', textAlign: 'center' },
  defaultBadge: { ...Type.caption },
  fab: { position: 'absolute', bottom: Space.xl, right: Space.lg, backgroundColor: Colors.primary.main },
  modal: { margin: Space.lg, borderRadius: Radius.lg, padding: Space.xl },
  modalTitle: { ...Type.title, marginBottom: Space.lg },
  field: { marginBottom: Space.md },
  fieldLabel: { ...Type.body, fontWeight: '600', marginBottom: Space.sm },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, marginBottom: Space.lg },
  colorDot: { width: 32, height: 32, borderRadius: Radius.pill },
  colorDotSelected: { borderWidth: 3 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm, marginBottom: Space.lg },
  iconItem: {
    width: TOUCH,
    height: TOUCH,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
