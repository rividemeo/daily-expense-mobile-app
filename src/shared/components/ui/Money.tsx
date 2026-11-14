import React from 'react';
import { StyleSheet, View, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { getCurrencyByCode } from '@/shared/constants/currencies';
import { formatCurrency } from '@/shared/utils/formatCurrency';
import { useTheme } from '@/hooks/useTheme';

interface MoneyProps {
  amount: number;
  currency: string;
  size?: number;
  color?: string;
  /** Colour of the small currency symbol; defaults to gray. */
  symbolColor?: string;
  hidden?: boolean;
  compact?: boolean;
  style?: TextStyle;
}

// Big amount with a small gray currency symbol in front: "Rp 3.465.800".
export function Money({ amount, currency, size = 34, color, symbolColor, hidden, compact, style }: MoneyProps) {
  const { colors } = useTheme();
  const symbol = getCurrencyByCode(currency).symbol;
  const full = formatCurrency(amount, currency, { compact });
  const sign = full.startsWith('-') ? '−' : '';
  const digits = hidden ? '••••••' : full.replace('-', '').replace(symbol, '');
  return (
    <View style={styles.row} accessible accessibilityLabel={hidden ? 'Amount hidden' : full}>
      <Text style={{ fontSize: size * 0.5, lineHeight: size * 0.62, fontWeight: '600', color: symbolColor ?? colors.textTertiary }}>
        {sign}{symbol.trim()}
      </Text>
      <Text
        style={[{ fontSize: size, lineHeight: size * 1.2, fontWeight: '700', letterSpacing: -0.5, color: color ?? colors.text }, style]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {' '}{digits}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', flexShrink: 1 },
});
