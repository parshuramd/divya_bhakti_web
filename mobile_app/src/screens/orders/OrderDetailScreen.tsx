import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order, OrderTimeline as OrderTimelineType } from '../../types';
import { orderService } from '../../services/orderService';
import { COLORS, SIZES, ORDER_STATUS_CONFIG } from '../../constants';
import { formatPrice, formatDate, formatDateTime } from '../../utils/format';
import { LoadingSpinner } from '../../components';

export default function OrderDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await orderService.getOrderDetail(orderId);
        setOrder(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  if (loading || !order) return <LoadingSpinner fullScreen />;

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    color: COLORS.textSecondary,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Card */}
      <View style={[styles.statusCard, { borderLeftColor: statusConfig.color }]}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
          <Text style={styles.orderId}>#{order.orderNumber}</Text>
        </View>
        <Text style={styles.orderDate}>Ordered on {formatDate(order.createdAt)}</Text>
        {order.trackingUrl && (
          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => Linking.openURL(order.trackingUrl!)}
          >
            <Ionicons name="locate-outline" size={16} color={COLORS.primary} />
            <Text style={styles.trackText}>Track Order</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          {order.timeline.map((event, index) => (
            <OrderTimelineItem
              key={event.id}
              event={event}
              isFirst={index === 0}
              isLast={index === order.timeline!.length - 1}
            />
          ))}
        </View>
      )}

      {/* Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Image
              source={{ uri: item.product?.images?.[0]?.url || 'https://via.placeholder.com/60' }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>{formatPrice(item.total)}</Text>
          </View>
        ))}
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <Text style={styles.addressName}>{order.address.fullName}</Text>
        <Text style={styles.addressText}>
          {order.address.addressLine1}
          {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ''}
        </Text>
        <Text style={styles.addressText}>
          {order.address.city}, {order.address.state} - {order.address.pincode}
        </Text>
        <Text style={styles.addressPhone}>{order.address.phone}</Text>
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <SummaryRow label="Subtotal" value={formatPrice(order.subtotal)} />
        <SummaryRow label="Shipping" value={order.shippingCost === 0 ? 'FREE' : formatPrice(order.shippingCost)} />
        {order.discount > 0 && (
          <SummaryRow label="Discount" value={`-${formatPrice(order.discount)}`} />
        )}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
        </View>
        <View style={styles.paymentMethodRow}>
          <Text style={styles.paymentMethodLabel}>Payment</Text>
          <Text style={styles.paymentMethodValue}>
            {order.paymentMethod} ({order.paymentStatus})
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function OrderTimelineItem({
  event,
  isFirst,
  isLast,
}: {
  event: OrderTimelineType;
  isFirst: boolean;
  isLast: boolean;
}) {
  const config = ORDER_STATUS_CONFIG[event.status] || { color: COLORS.textTertiary };
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineDotCol}>
        <View style={[styles.timelineDot, { backgroundColor: config.color }]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineStatus}>{event.message || event.status}</Text>
        <Text style={styles.timelineDate}>{formatDateTime(event.createdAt)}</Text>
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
  content: {
    padding: SIZES.md,
    paddingBottom: SIZES.xxl,
  },
  statusCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
  },
  orderId: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  orderDate: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.sm,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: SIZES.radiusSm,
  },
  trackText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.fontMd,
  },
  section: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 50,
  },
  timelineDotCol: {
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SIZES.md,
  },
  timelineStatus: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  timelineDate: {
    fontSize: SIZES.fontXs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  itemName: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  itemQty: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressName: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  addressText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  addressPhone: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 4,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SIZES.sm,
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
  paymentMethodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SIZES.sm,
  },
  paymentMethodLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  paymentMethodValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
});
