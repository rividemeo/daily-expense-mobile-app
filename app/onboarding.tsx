import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/shared/constants/colors';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { setOnboardingDone } from '@/services/storage/secureStorage';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/shared/components/ui/Button';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'wallet-outline',
    title: 'Track Every\nExpense',
    description: 'Record your daily income and expenses with ease. Know exactly where your money is going.',
  },
  {
    id: '2',
    icon: 'chart-donut',
    title: 'Smart Budget\nManagement',
    description: 'Set budgets for different categories and get alerts before you overspend.',
  },
  {
    id: '3',
    icon: 'shield-lock-outline',
    title: 'Private &\nOffline First',
    description: 'All your financial data stays on your device. No account needed, no data sent to servers.',
  },
  {
    id: '4',
    icon: 'chart-areaspline',
    title: 'Insightful\nReports',
    description: 'Beautiful charts and detailed reports to understand your financial health at a glance.',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingCompleted } = useAuthStore();
  const { colors, accent, isDark } = useTheme();

  const finish = async () => {
    await setOnboardingDone();
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      await finish();
    }
  };

  const renderSlide: ListRenderItem<OnboardingSlide> = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.slideContent}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceAlt }]}>
          <MaterialCommunityIcons name={item.icon as any} size={64} color={accent} />
        </View>
        <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.slideDescription, { color: colors.textSecondary }]}>{item.description}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={finish} style={styles.skipButton} accessibilityRole="button">
          <Text style={[styles.skipText, { color: colors.textSecondary }]}>
            {activeIndex === SLIDES.length - 1 ? '' : 'Skip'}
          </Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === activeIndex ? 24 : 8,
                  backgroundColor: i === activeIndex ? accent : colors.track,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.nextButton}
          accessibilityRole="button"
          accessibilityLabel={activeIndex === SLIDES.length - 1 ? 'Get started' : 'Next'}
        >
          <MaterialCommunityIcons
            name={activeIndex === SLIDES.length - 1 ? 'check' : 'arrow-right'}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { width, height: height - 120, alignItems: 'center', justifyContent: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: Space.xxl },
  iconWrapper: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.xxl,
  },
  slideTitle: {
    ...Type.display,
    textAlign: 'center',
    marginBottom: Space.lg,
  },
  slideDescription: {
    ...Type.bodyLg,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
    paddingVertical: Space.xl,
    height: 120,
  },
  skipButton: { width: 60, minHeight: TOUCH, justifyContent: 'center' },
  skipText: { ...Type.body },
  dots: { flexDirection: 'row', gap: Space.sm, alignItems: 'center' },
  dot: { height: 8, borderRadius: Radius.pill },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
