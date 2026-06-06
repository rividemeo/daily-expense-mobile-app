import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Text, HelperText } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';
import { getCurrencyByCode } from '@/shared/constants/currencies';

interface CurrencyInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  currency?: string;
  label?: string;
  error?: string;
  style?: object;
}

export function CurrencyInput({
  value,
  onChangeValue,
  currency = 'IDR',
  label = 'Amount',
  error,
  style,
}: CurrencyInputProps) {
  const currencyInfo = getCurrencyByCode(currency);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    onChangeValue(cleaned);
  };

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
            textStyle={{ fontSize: 18, fontWeight: '700', color: Colors.primary.main }}
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
  input: {
    backgroundColor: 'transparent',
    fontSize: 24,
    fontWeight: '700',
  },
  outline: {
    borderRadius: 12,
  },
  content: {
    fontSize: 24,
    fontWeight: '700',
  },
});
