import React from 'react';
import { View, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { Radius, Type } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { getCurrencyByCode } from '@/shared/constants/currencies';

interface CurrencyInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currency?: string;
  label?: string;
  error?: string;
  style?: object;
  /** Big centred number like the iOS Wallet / Cash amount entry. */
  large?: boolean;
}

export function CurrencyInput({
  value,
  onChangeValue,
  currency = 'IDR',
  label = 'Amount',
  error,
  style,
  large,
}: CurrencyInputProps) {
  const currencyInfo = getCurrencyByCode(currency);
  const { accent, colors, sys } = useTheme();

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChangeValue(cleaned);
  };

  if (large) {
    return (
      <View style={[styles.hero, style]}>
        {/* Symbol and number are drawn as one centred line; an invisible input on top takes the typing. */}
        <View style={styles.heroRow}>
          <Text style={[styles.heroSymbol, { color: colors.textSecondary }]}>{currencyInfo.symbol}</Text>
          <Text style={[styles.heroValue, { color: value ? colors.text : colors.textTertiary }]} numberOfLines={1} adjustsFontSizeToFit>
            {value ? Number(value).toLocaleString(currencyInfo.locale, { maximumFractionDigits: 2 }) : '0'}
          </Text>
          <RNTextInput
            value={value}
            onChangeText={handleChange}
            keyboardType="decimal-pad"
            accessibilityLabel={label}
            caretHidden
            style={styles.heroInput}
          />
        </View>
        {error ? <Text style={[Type.footnote, { color: sys.red }]}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View style={style}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleChange}
        keyboardType="decimal-pad"
        mode="outlined"
        error={!!error}
        left={
          <TextInput.Affix
            text={currencyInfo.symbol}
            textStyle={{ ...Type.title, fontWeight: '700', color: accent }}
          />
        }
        style={styles.input}
        outlineStyle={styles.outline}
        contentStyle={styles.content}
      />
      {error && (
        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 4 },
  heroRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', alignSelf: 'stretch', paddingHorizontal: 16 },
  heroSymbol: { fontSize: 28, fontWeight: '600', marginRight: 6 },
  heroValue: { fontSize: 46, lineHeight: 56, fontWeight: '700', flexShrink: 1 },
  heroInput: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0 },
  input: {
    backgroundColor: 'transparent',
    fontSize: Type.headline.fontSize,
    fontWeight: '700',
  },
  outline: {
    borderRadius: Radius.md,
  },
  content: {
    fontSize: Type.headline.fontSize,
    fontWeight: '700',
  },
});
