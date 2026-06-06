import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { Colors } from '@/shared/constants/colors';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}

export function Input({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  multiline,
  numberOfLines,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled,
  style,
  autoCapitalize,
  maxLength,
}: InputProps) {
  return (
    <View style={style}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={!!error}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        left={leftIcon ? <TextInput.Icon icon={leftIcon} /> : undefined}
        right={
          rightIcon ? (
            <TextInput.Icon icon={rightIcon} onPress={onRightIconPress} />
          ) : undefined
        }
        disabled={disabled}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        mode="outlined"
        style={[styles.input, multiline && { height: (numberOfLines ?? 3) * 48 }]}
        outlineStyle={styles.outline}
      />
      {error ? (
        <HelperText type="error" visible={!!error} style={styles.helperText}>
          {error}
        </HelperText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  outline: {
    borderRadius: 12,
  },
  helperText: {
    marginTop: -4,
  },
});
