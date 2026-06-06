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
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/shared/constants/colors';
import { setOnboardingDone } from '@/services/storage/secureStorage';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/shared/components/ui/Button';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  gradient: [string, string];
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'wallet-outline',
    title: 'Track Every\nExpense',
    description: 'Record your daily income and expenses with ease. Know exactly where your money is going.',
    gradient: [Colors.primary[700], Colors.primary[500]],
  },
  {
    id: '2',
    icon: 'chart-donut',
    title: 'Smart Budget\nManagement',
    description: 'Set budgets for different categories and get alerts before you overspend.',
    gradient: ['#7C3AED', '#A855F7'],
  },
  {
    id: '3',
    icon: 'shield-lock-outline',
    title: 'Private &\nOffline First',
    description: 'All your financial data stays on your device. No account needed, no data sent to servers.',
    gradient: ['#0F766E', '#14B8A6'],
  },
  {
    id: '4',
    icon: 'chart-areaspline',
    title: 'Insightful\nReports',
    description: 'Beautiful charts and detailed reports to understand your financial health at a glance.',
    gradient: ['#B45309', '#F59E0B'],
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { setOnboardingCompleted } = useAuthStore();

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
    <LinearGradient colors={item.gradient} style={styles.slide}>
      <View style={styles.slideContent}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name={item.icon as any} size={80} color={Colors.white} />
        </View>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
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
        <TouchableOpacity onPress={finish} style={styles.skipButton}>
          <Text style={styles.skipText}>
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
                  backgroundColor: i === activeIndex ? Colors.primary.main : Colors.grey[300],
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
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
  container: { flex: 1, backgroundColor: Colors.light.background },
  slide: { width, height: height - 120, alignItems: 'center', justifyContent: 'center' },
  slideContent: { alignItems: 'center', paddingHorizontal: 40 },
  iconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    height: 120,
  },
  skipButton: { width: 60 },
  skipText: { color: Colors.grey[500], fontSize: 15 },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: { height: 8, borderRadius: 4 },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
