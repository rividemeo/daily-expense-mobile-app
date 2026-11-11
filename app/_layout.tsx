import React, { useEffect, useCallback } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/shared/constants/colors';
import { useAuthStore } from '@/stores/authStore';
import { isOnboardingDone } from '@/services/storage/secureStorage';
import { Snackbar } from 'react-native-paper';
import { useUIStore } from '@/stores/uiStore';
import { User } from '@/types/models';

SplashScreen.preventAutoHideAsync();

const USER_PROFILE_KEY = 'local_user_profile';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 0, staleTime: 3 * 60 * 1000 },
  },
});

function createLocalUser(): User {
  return {
    id: `local_${Date.now()}`,
    name: 'My Account',
    email: '',
    currency: 'IDR',
    language: 'en',
    theme: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function AppContent() {
  const { theme, isDark } = useTheme();
  const { setUser, setLoading, setOnboardingCompleted } = useAuthStore();
  const { snackbar, hideSnackbar } = useUIStore();

  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  const bootstrapApp = useCallback(async () => {
    try {
      const [onboardingDone, savedProfile] = await Promise.all([
        isOnboardingDone(),
        AsyncStorage.getItem(USER_PROFILE_KEY),
      ]);

      setOnboardingCompleted(onboardingDone);

      if (savedProfile) {
        setUser(JSON.parse(savedProfile));
      } else {
        const user = createLocalUser();
        await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
        setUser(user);
      }
    } catch {
      setUser(createLocalUser());
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setOnboardingCompleted]);

  useEffect(() => {
    bootstrapApp();
  }, [bootstrapApp]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <Stack screenOptions={{ headerShown: false }} />
        <Snackbar
          visible={snackbar?.visible ?? false}
          onDismiss={hideSnackbar}
          duration={3000}
          style={{
            backgroundColor:
              snackbar?.type === 'success' ? Colors.success.main
              : snackbar?.type === 'error' ? Colors.error.main
              : Colors.grey[800],
          }}
        >
          {snackbar?.message ?? ''}
        </Snackbar>
      </View>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
