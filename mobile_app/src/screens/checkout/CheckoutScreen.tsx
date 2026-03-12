import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAppDispatch,
  useAppSelector,
  selectCartItems,
  selectCartSubtotal,
  selectShippingCost,
  selectCartTotal,
  selectCartDiscount,
  clearCart,
  applyCoupon,
  removeCoupon,
} from '../../store';
import { Address, Coupon } from '../../types';
import { orderService } from '../../services/orderService';
import { CONFIG, COLORS, SIZES, SHADOWS } from '../../constants';
import { formatPrice } from '../../utils/format';
import { CustomButton, LoadingSpinner } from '../../components';

type PaymentMethod = 'RAZORPAY' | 'COD';

export default function CheckoutScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const shipping = useAppSelector(selectShippingCost);
  const discount = useAppSelector(selectCartDiscount);
  const total = useAppSelector(selectCartTotal);
  const coupon = useAppSelector((state) => state.cart.coupon);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('RAZORPAY');
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const data = await orderService.getAddresses();
      setAddresses(data);
      const defaultAddr = data.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (data.length) setSelectedAddressId(data[0].id);
    } catch {
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    try {
      const result = await orderService.applyCoupon(couponCode.trim(), subtotal);
      dispatch(applyCoupon(result.coupon));
      Alert.alert('Coupon Applied', `You saved ${formatPrice(result.coupon.discountAmount)}!`);
    } catch (err: any) {
      Alert.alert('Invalid Coupon', err.response?.data?.error || 'Coupon could not be applied');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = useCallback(async () => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address');
      return;
    }
    if (!items.length) return;

    setPlacingOrder(true);
    const orderPayload = {
      addressId: selectedAddressId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      couponCode: coupon?.code,
      notes: notes.trim() || undefined,
    };

    try {
      if (paymentMethod === 'COD') {
        const result = await orderService.createCodOrder(orderPayload);
        dispatch(clearCart());
        navigation.replace('OrderConfirmation', {
          orderId: result.orderId,
          orderNumber: result.orderNumber,
        });
      } else {
        // Razorpay flow
        const razorpayOrder = await orderService.createRazorpayOrder(orderPayload);

        // On mobile, open Razorpay checkout URL or use RN Razorpay SDK
        // For now, we'll use a deep-link approach with the Razorpay SDK
        const options = {
          description: `Order at ${CONFIG.APP_NAME}`,
          currency: razorpayOrder.currency,
          key: razorpayOrder.key,
          amount: razorpayOrder.amount,
          name: CONFIG.APP_NAME,
          order_id: razorpayOrder.razorpayOrderId,
          prefill: {},
          theme: { color: COLORS.primary },
        };

        // In production, use react-native-razorpay:
        // import RazorpayCheckout from 'react-native-razorpay';
        // const paymentData = await RazorpayCheckout.open(options);
        // await orderService.verifyPayment({
        //   razorpay_order_id: paymentData.razorpay_order_id,
        //   razorpay_payment_id: paymentData.razorpay_payment_id,
        //   razorpay_signature: paymentData.razorpay_signature,
        //   orderId: razorpayOrder.orderId,
        // });

        Alert.alert(
          'Razorpay Integration',
          'In production, this opens the Razorpay payment sheet. Install react-native-razorpay to enable.',
          [
            {
              text: 'Simulate Success',
              onPress: () => {
                dispatch(clearCart());
                navigation.replace('OrderConfirmation', {
                  orderId: razorpayOrder.orderId,
                  orderNumber: 'ORD-DEMO',
                });
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Order Failed', err.response?.data?.error || 'Something went wrong');
    } finally {
      setPlacingOrder(false);
    }
  }, [selectedAddressId, items, paymentMethod, coupon, notes, dispatch, navigation]);

  if (loadingAddresses) return <LoadingSpinner fullScreen />;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>
          {addresses.length === 0 ? (
            <CustomButton
              title="Add New Address"
              onPress={() => Alert.alert('Coming Soon', 'Address form will be here')}
              variant="outline"
              fullWidth
              icon="add-outline"
            />
          ) : (
            <>
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    addr.id === selectedAddressId && styles.addressCardSelected,
                  ]}
                  onPress={() => setSelectedAddressId(addr.id)}
                >
                  <View style={styles.radioOuter}>
                    {addr.id === selectedAddressId && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.addressContent}>
                    <View style={styles.addressHeader}>
                      <Text style={styles.addressName}>{addr.fullName}</Text>
                      <View style={styles.addressTypeBadge}>
                        <Text style={styles.addressTypeText}>{addr.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.addressText}>
                      {addr.addressLine1}
                      {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                    </Text>
                    <Text style={styles.addressText}>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </Text>
                    <Text style={styles.addressPhone}>{addr.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'RAZORPAY' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('RAZORPAY')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'RAZORPAY' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Pay Online</Text>
              <Text style={styles.paymentDesc}>UPI, Cards, Net Banking via Razorpay</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('COD')}
          >
            <View style={styles.radioOuter}>
              {paymentMethod === 'COD' && <View style={styles.radioInner} />}
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentLabel}>Cash on Delivery</Text>
              <Text style={styles.paymentDesc}>Pay when you receive the order</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Coupon Code</Text>
          </View>
          {coupon ? (
            <View style={styles.couponApplied}>
              <View>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponSavings}>
                  Saving {formatPrice(coupon.discountAmount)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => dispatch(removeCoupon())}>
                <Ionicons name="close-circle" size={22} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInput}>
              <TextInput
                style={styles.couponField}
                placeholder="Enter coupon code"
                placeholderTextColor={COLORS.textTertiary}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <CustomButton
                title="Apply"
                onPress={handleApplyCoupon}
                loading={applyingCoupon}
                size="sm"
              />
            </View>
          )}
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Order Notes</Text>
          </View>
          <TextInput
            style={styles.notesInput}
            placeholder="Add special instructions (optional)"
            placeholderTextColor={COLORS.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.productId} style={styles.orderItem}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {item.product.name} x{item.quantity}
              </Text>
              <Text style={styles.orderItemPrice}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
          <SummaryRow
            label="Shipping"
            value={shipping === 0 ? 'FREE' : formatPrice(shipping)}
          />
          {discount > 0 && (
            <SummaryRow label="Discount" value={`-${formatPrice(discount)}`} />
          )}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.bottomBar, SHADOWS.lg]}>
        <View>
          <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
          <Text style={styles.bottomSubtext}>
            {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Pay Online'}
          </Text>
        </View>
        <CustomButton
          title="Place Order"
          onPress={handlePlaceOrder}
          loading={placingOrder}
          icon="checkmark-circle-outline"
          iconPosition="right"
          style={{ flex: 1, marginLeft: SIZES.md }}
        />
      </View>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SIZES.md,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  addressCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    gap: 12,
  },
  addressCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8F0',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressName: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressTypeBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addressTypeText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  addressText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 4,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    gap: 12,
  },
  paymentOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF8F0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  paymentDesc: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  couponApplied: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
  },
  couponCode: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.success,
  },
  couponSavings: {
    fontSize: SIZES.fontSm,
    color: COLORS.success,
    marginTop: 2,
  },
  couponInput: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  couponField: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: 8,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radiusSm,
    padding: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    minHeight: 80,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  orderItemName: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginRight: SIZES.md,
  },
  orderItemPrice: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SIZES.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
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
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  bottomBar: {
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
  bottomTotal: {
    fontSize: SIZES.fontXl,
    fontWeight: '800',
    color: COLORS.text,
  },
  bottomSubtext: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
});
