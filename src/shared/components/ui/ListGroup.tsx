import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Space, Radius, Type, TOUCH } from '@/shared/constants/theme';
import { useTheme } from '@/hooks/useTheme';

// iOS "inset grouped" list: rounded white block, hairline separators between rows,
// optional uppercase header and gray footer note.
interface ListGroupProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  /** Left inset of separators, so they start under the text, not the icon. */
  separatorInset?: number;
  style?: ViewStyle;
}

export function ListGroup({ children, header, footer, separatorInset = Space.lg, style }: ListGroupProps) {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.wrap, style]}>
      {header ? <Text style={[styles.header, { color: colors.textSecondary }]}>{header.toUpperCase()}</Text> : null}
      <View style={[styles.group, { backgroundColor: colors.surface }]}>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={[styles.sep, { marginLeft: separatorInset, backgroundColor: colors.divider }]} />}
            {row}
          </React.Fragment>
        ))}
      </View>
      {footer ? <Text style={[styles.footer, { color: colors.textSecondary }]}>{footer}</Text> : null}
    </View>
  );
}

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Ionicons name, drawn white on a coloured rounded square like iOS Settings. */
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  /** Gray text on the right, e.g. the current setting. */
  value?: string;
  /** Custom right side (a Switch, a badge). Replaces value and chevron. */
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  destructive?: boolean;
  /** Pick-one lists: shows a blue checkmark and tells screen readers it's selected. */
  selected?: boolean;
}

export const ROW_ICON_INSET = Space.lg + 29 + Space.md;

export function ListRow({ title, subtitle, icon, iconColor, value, right, onPress, selected, chevron = !!onPress && selected === undefined, destructive }: ListRowProps) {
  const { colors, sys, accent } = useTheme();
  if (selected) right = <Ionicons name="checkmark" size={22} color={accent} />;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}
    >
      {icon ? (
        <View style={[styles.icon, { backgroundColor: iconColor ?? sys.gray }]}>
          <Ionicons name={icon} size={18} color="#FFFFFF" />
        </View>
      ) : null}
      <View style={styles.texts}>
        <Text style={[styles.title, { color: destructive ? sys.red : colors.text }]} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>{subtitle}</Text> : null}
      </View>
      {right ?? (
        <>
          {value ? <Text style={[styles.value, { color: colors.textSecondary }]} numberOfLines={1}>{value}</Text> : null}
          {chevron ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: Space.lg },
  header: { ...Type.footnote, paddingHorizontal: Space.lg, marginBottom: 6 },
  footer: { ...Type.footnote, paddingHorizontal: Space.lg, marginTop: 6 },
  group: { borderRadius: Radius.md, overflow: 'hidden' },
  sep: { height: StyleSheet.hairlineWidth },
  row: {
    minHeight: TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    paddingVertical: 11,
    gap: Space.md,
  },
  icon: { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
  title: { ...Type.bodyLg },
  subtitle: { ...Type.footnote, marginTop: 1 },
  value: { ...Type.bodyLg, maxWidth: '50%' },
});
