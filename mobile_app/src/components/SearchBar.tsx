import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface Props {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onPress?: () => void;
  editable?: boolean;
  autoFocus?: boolean;
  onSubmit?: () => void;
}

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search devotional products...',
  onPress,
  editable = true,
  autoFocus = false,
  onSubmit,
}: Props) {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      style={styles.container}
      {...(onPress ? { onPress, activeOpacity: 0.7 } : {})}
    >
      <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textTertiary}
        editable={editable && !onPress}
        autoFocus={autoFocus}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText?.('')}>
          <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
        </TouchableOpacity>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    marginHorizontal: SIZES.md,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    padding: 0,
  },
});
