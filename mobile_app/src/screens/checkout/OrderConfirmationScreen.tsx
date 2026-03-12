import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, CONFIG } from '../../constants';
import { CustomButton } from '../../components';

export default function OrderConfirmationScreen({ route, navigation }: any) {
  const { orderNumber } = route.params;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been placed successfully. We'll send you updates about your order.
        </Text>
        <View style={styles.orderCard}>
          <Text style={styles.orderLabel}>Order Number</Text>
          <Text style={styles.orderNumber}>{orderNumber}</Text>
        </View>
        <Text style={styles.thankYou}>
          Thank you for shopping with {CONFIG.APP_NAME}
        </Text>
      </View>

      <View style={styles.actions}>
        <CustomButton
          title="View My Orders"
          onPress={() => {
            navigation.getParent()?.getParent()?.navigate('Orders');
          }}
          fullWidth
        />
        <CustomButton
          title="Continue Shopping"
          onPress={() => {
            navigation.getParent()?.getParent()?.navigate('Home');
          }}
          variant="outline"
          fullWidth
          style={{ marginTop: SIZES.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  iconCircle: {
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SIZES.xl,
  },
  orderCard: {
    backgroundColor: '#FFF8F0',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderStyle: 'dashed',
  },
  orderLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: SIZES.fontTitle,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  thankYou: {
    fontSize: SIZES.fontSm,
    color: COLORS.textTertiary,
    marginTop: SIZES.xl,
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
});
