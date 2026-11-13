import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TransactionType } from '@/types/models';
import { memoryKey, type CategoryMemory } from './bcaStatement';

// Category choices the user made by hand, keyed by transaction name. Lives only on the
// phone (never in the repo), so the importer learns the user's own shops and people.
const KEY = 'category_memory_v1';

export async function loadCategoryMemory(): Promise<CategoryMemory> {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}');
  } catch {
    return {};
  }
}

export async function rememberCategory(description: string, type: TransactionType, categoryId: string): Promise<void> {
  const memory = await loadCategoryMemory();
  memory[memoryKey(description)] = { type, categoryId };
  await AsyncStorage.setItem(KEY, JSON.stringify(memory));
}
