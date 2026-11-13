import React from 'react';
import { StyleSheet, View, ViewStyle, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius, Type, Space, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

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

// iOS form field: small gray label above a white rounded field, red note below on error.
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
  const { colors, sys, accent } = useTheme();
  return (
    <View style={style}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      <View
        style={[
          styles.field,
          { backgroundColor: colors.surface, borderColor: error ? sys.red : 'transparent' },
          multiline && { minHeight: (numberOfLines ?? 3) * 24 + Space.lg, alignItems: 'flex-start' },
          disabled && { opacity: 0.5 },
        ]}
      >
        {leftIcon ? <MaterialCommunityIcons name={leftIcon as any} size={20} color={colors.textTertiary} /> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          selectionColor={accent}
          accessibilityLabel={label}
          style={[styles.input, { color: colors.text }, multiline && { textAlignVertical: 'top', paddingTop: Space.md }]}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={rightIcon.startsWith('eye') ? 'Show or hide text' : rightIcon}
          >
            <MaterialCommunityIcons name={rightIcon as any} size={20} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: sys.red }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...Type.footnote, marginLeft: Space.lg, marginBottom: 6 },
  field: {
    minHeight: TOUCH,
    borderRadius: Radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    gap: Space.sm,
  },
  input: { flex: 1, ...Type.bodyLg, paddingVertical: 10 },
  error: { ...Type.footnote, marginLeft: Space.lg, marginTop: 6 },
});
