import { Colors } from '@/shared/constants/colors';
import React, { useEffect, useCallback } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import { isOnboardingDone } from '@/services/storage/secureStorage';
import { Snackbar } from 'react-native-paper';
import { useUIStore } from '@/stores/uiStore';
import { User } from '@/types/models';

SplashScreen.preventAutoHideAsync();
// Fade from the splash into the app instead of a hard cut.
SplashScreen.setOptions({ duration: 400, fade: true });

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
  const { theme, sys, isDark } = useTheme();
  const { setUser, setLoading, setOnboardingCompleted } = useAuthStore();
  const { snackbar, hideSnackbar } = useUIStore();

  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
    ...Ionicons.font, // tab bar and iOS-style chrome
  });
  const loading = useAuthStore((s) => s.isLoading);

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

  // Keep the splash up until icons and the saved profile are ready, so the first frame
  // the user sees is the real app, not a blank screen or a spinner.
  useEffect(() => {
    if (fontsLoaded && !loading) SplashScreen.hideAsync();
  }, [fontsLoaded, loading]);

  if (!fontsLoaded) return null;

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }}>
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
          style={{ backgroundColor: snackbar?.type === 'error' ? sys.red : '#1C1C1E', borderRadius: 12 }}
          theme={{ colors: { inverseOnSurface: '#FFFFFF', inversePrimary: Colors.brand.orange } }}
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
