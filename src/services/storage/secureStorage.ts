import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
  ONBOARDING_DONE: 'onboarding_done',
} as const;

// Web falls back to localStorage since SecureStore is native-only
async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function saveTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await setItem(KEYS.ACCESS_TOKEN, accessToken);
  await setItem(KEYS.REFRESH_TOKEN, refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

export async function clearTokens(): Promise<void> {
  await removeItem(KEYS.ACCESS_TOKEN);
  await removeItem(KEYS.REFRESH_TOKEN);
}

export async function saveUserId(userId: string): Promise<void> {
  await setItem(KEYS.USER_ID, userId);
}

export async function getUserId(): Promise<string | null> {
  return getItem(KEYS.USER_ID);
}

export async function setOnboardingDone(): Promise<void> {
  await setItem(KEYS.ONBOARDING_DONE, 'true');
}

export async function isOnboardingDone(): Promise<boolean> {
  const value = await getItem(KEYS.ONBOARDING_DONE);
  return value === 'true';
}

export async function clearAll(): Promise<void> {
  await removeItem(KEYS.ACCESS_TOKEN);
  await removeItem(KEYS.REFRESH_TOKEN);
  await removeItem(KEYS.USER_ID);
}
