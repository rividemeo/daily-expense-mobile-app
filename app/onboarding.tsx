import React, { useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Dimensions, ListRenderItem } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Space, Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { setOnboardingDone } from '@/services/storage/secureStorage';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/shared/components/ui/Button';

const { width } = Dimensions.get('window');

type SysColor = 'blue' | 'green' | 'indigo' | 'orange';

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: SysColor;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'wallet',
    color: 'blue',
    title: 'Track Every\nExpense',
    description: 'Record your daily income and expenses with ease. Know exactly where your money is going.',
  },
  {
    id: '2',
    icon: 'pie-chart',
    color: 'orange',
    title: 'Smart Budget\nManagement',
    description: 'Set budgets for different categories and get alerts before you overspend.',
  },
  {
    id: '3',
    icon: 'lock-closed',
    color: 'green',
    title: 'Private &\nOffline First',
    description: 'All your financial data stays on your device. No account needed, no data sent to servers.',
  },
  {
    id: '4',
    icon: 'stats-chart',
    color: 'indigo',
    title: 'Insightful\nReports',
    description: 'Beautiful charts and detailed reports to understand your financial health at a glance.',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingCompleted } = useAuthStore();
  const { colors, sys, accent, isDark } = useTheme();
  const isLast = activeIndex === SLIDES.length - 1;

  const finish = async () => {
    await setOnboardingDone();
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    if (!isLast) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      await finish();
    }
  };

  const renderSlide: ListRenderItem<OnboardingSlide> = ({ item }) => (
    <View style={styles.slide}>
      <View style={[styles.tile, { backgroundColor: sys[item.color] }]}>
        <Ionicons name={item.icon} size={52} color="#FFFFFF" />
      </View>
      <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.slideDescription, { color: colors.textSecondary }]}>{item.description}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.list}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === activeIndex ? accent : colors.track }]}
            />
          ))}
        </View>

        <Button
          onPress={handleNext}
          size="large"
          fullWidth
        >
          {isLast ? 'Get Started' : 'Continue'}
        </Button>
        <Button onPress={finish} variant="text" fullWidth style={isLast ? styles.hidden : undefined} disabled={isLast}>
          Skip
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  // Fixed top offset: horizontal list items don't stretch to full height on every platform.
  slide: { width, alignItems: 'center', paddingTop: Dimensions.get('window').height * 0.16, paddingHorizontal: Space.xxl },
  tile: {
    width: 96,
    height: 96,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xxl,
  },
  slideTitle: { ...Type.display, textAlign: 'center', marginBottom: Space.md },
  slideDescription: { ...Type.bodyLg, textAlign: 'center' },
  footer: { paddingHorizontal: Space.xl, paddingBottom: Space.lg, gap: Space.md },
  dots: { flexDirection: 'row', gap: Space.sm, alignSelf: 'center', marginBottom: Space.sm },
  dot: { width: 8, height: 8, borderRadius: Radius.pill },
  hidden: { opacity: 0 },
});
