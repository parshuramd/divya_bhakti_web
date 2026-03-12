import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAppDispatch,
  useAppSelector,
  selectCartItems,
  selectCartSubtotal,
  selectShippingCost,
  selectCartTotal,
  selectCartItemCount,
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from '../../store';
import { CartItem } from '../../types';
import { COLORS, SIZES, SHADOWS, CONFIG } from '../../constants';
import { formatPrice } from '../../utils/format';
import { EmptyState, CustomButton, QuantityStepper } from '../../components';

export default function CartScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingCost);
  const total = useAppSelector(selectCartTotal);
  const itemCount = useAppSelector(selectCartItemCount);
  const coupon = useAppSelector((state) => state.cart.coupon);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handleRemove = useCallback(
    (productId: string, productName: string) => {
      Alert.alert('Remove Item', `Remove ${productName} from cart?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => dispatch(removeFromCart(productId)),
        },
      ]);
    },
    [dispatch]
  );

  const handleCheckout = useCallback(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to proceed with checkout');
      return;
    }
    navigation.navigate('Checkout');
  }, [isAuthenticated, navigation]);

  const renderCartItem = useCallback(
    ({ item }: { item: CartItem }) => {
      const primaryImage =
        item.product.images?.find((img) => img.isPrimary) || item.product.images?.[0];
      return (
        <View style={[styles.cartItem, SHADOWS.sm]}>
          <Image
            source={{ uri: primaryImage?.url || 'https://via.placeholder.com/80' }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.product.name}
            </Text>
            <Text style={styles.itemPrice}>{formatPrice(item.product.price)}</Text>
            <View style={styles.itemActions}>
              <QuantityStepper
                quantity={item.quantity}
                maxQuantity={item.product.stock}
                onIncrement={() => dispatch(incrementQuantity(item.productId))}
                onDecrement={() => dispatch(decrementQuantity(item.productId))}
                size="sm"
              />
              <TouchableOpacity
                onPress={() => handleRemove(item.productId, item.product.name)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.itemTotal}>
            {formatPrice(item.product.price * item.quantity)}
          </Text>
        </View>
      );
    },
    [dispatch, handleRemove]
  );

  const ListFooter = useMemo(() => {
    if (!items.length) return null;
    return (
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <SummaryRow label={`Subtotal (${itemCount} items)`} value={formatPrice(subtotal)} />
        <SummaryRow
          label="Shipping"
          value={shipping === 0 ? 'FREE' : formatPrice(shipping)}
          highlight={shipping === 0}
        />
        {coupon && (
          <SummaryRow
            label={`Discount (${coupon.code})`}
            value={`-${formatPrice(coupon.discountAmount)}`}
            highlight
          />
        )}
        {shipping > 0 && (
          <Text style={styles.freeShippingHint}>
            Add {formatPrice(CONFIG.SHIPPING_FREE_ABOVE - subtotal)} more for free shipping
          </Text>
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
      </View>
    );
  }, [items.length, itemCount, subtotal, shipping, total, coupon]);

  if (!items.length) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Your Cart is Empty"
        message="Add some devotional products to get started!"
        actionTitle="Browse Products"
        onAction={() => navigation.getParent()?.navigate('Home')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={ListFooter}
      />
      <View style={[styles.checkoutBar, SHADOWS.lg]}>
        <View>
          <Text style={styles.checkoutTotal}>{formatPrice(total)}</Text>
          <Text style={styles.checkoutSubtext}>{itemCount} items</Text>
        </View>
        <CustomButton
          title="Proceed to Checkout"
          onPress={handleCheckout}
          icon="arrow-forward-outline"
          iconPosition="right"
          style={{ flex: 1, marginLeft: SIZES.md }}
        />
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlight && { color: COLORS.success }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  list: {
    padding: SIZES.md,
    paddingBottom: 100,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.sm,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemTotal: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    alignSelf: 'flex-end',
    marginLeft: SIZES.sm,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginTop: SIZES.md,
  },
  summaryTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  freeShippingHint: {
    fontSize: SIZES.fontXs,
    color: COLORS.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.md,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.fontXl,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    paddingBottom: SIZES.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  checkoutTotal: {
    fontSize: SIZES.fontXl,
    fontWeight: '800',
    color: COLORS.text,
  },
  checkoutSubtext: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
});
