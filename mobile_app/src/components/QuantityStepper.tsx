import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface Props {
  quantity: number;
  maxQuantity?: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md';
}

export default function QuantityStepper({
  quantity,
  maxQuantity = 99,
  onIncrement,
  onDecrement,
  size = 'md',
}: Props) {
  const iconSize = size === 'sm' ? 14 : 18;
  const btnSize = size === 'sm' ? 26 : 32;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { width: btnSize, height: btnSize }, quantity <= 1 && styles.buttonDisabled]}
        onPress={onDecrement}
        disabled={quantity <= 1}
      >
        <Ionicons name="remove" size={iconSize} color={quantity <= 1 ? COLORS.textTertiary : COLORS.primary} />
      </TouchableOpacity>
      <Text style={[styles.quantity, size === 'sm' && styles.quantitySm]}>{quantity}</Text>
      <TouchableOpacity
        style={[styles.button, { width: btnSize, height: btnSize }, quantity >= maxQuantity && styles.buttonDisabled]}
        onPress={onIncrement}
        disabled={quantity >= maxQuantity}
      >
        <Ionicons
          name="add"
          size={iconSize}
          color={quantity >= maxQuantity ? COLORS.textTertiary : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  button: {
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: COLORS.borderLight,
  },
  quantity: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  quantitySm: {
    fontSize: SIZES.fontMd,
    minWidth: 24,
  },
});
