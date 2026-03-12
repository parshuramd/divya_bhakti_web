import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../../navigation/types';
import { Order } from '../../types';
import { orderService } from '../../services/orderService';
import { COLORS, SIZES, SHADOWS, ORDER_STATUS_CONFIG } from '../../constants';
import { formatPrice, formatDate } from '../../utils/format';
import { LoadingSpinner, EmptyState } from '../../components';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersScreen'>;

export default function OrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch {
      // handle gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders();
  }, [loadOrders]);

  const renderOrder = useCallback(
    ({ item }: { item: Order }) => {
      const statusConfig = ORDER_STATUS_CONFIG[item.status] || {
        label: item.status,
        color: COLORS.textSecondary,
      };
      return (
        <TouchableOpacity
          style={[styles.orderCard, SHADOWS.sm]}
          onPress={() =>
            navigation.navigate('OrderDetail', {
              orderId: item.id,
              orderNumber: item.orderNumber,
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
              </Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            {item.items.slice(0, 2).map((orderItem) => (
              <Text key={orderItem.id} style={styles.orderItemText} numberOfLines={1}>
                {orderItem.name} x{orderItem.quantity}
              </Text>
            ))}
            {item.items.length > 2 && (
              <Text style={styles.moreItems}>
                +{item.items.length - 2} more item{item.items.length - 2 > 1 ? 's' : ''}
              </Text>
            )}
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.orderTotal}>{formatPrice(item.total)}</Text>
            <View style={styles.viewDetails}>
              <Text style={styles.viewDetailsText}>View Details</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No Orders Yet"
            message="Your orders will appear here once you place one"
            actionTitle="Start Shopping"
            onAction={() => navigation.getParent()?.navigate('Home')}
          />
        }
      />
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
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    fontSize: SIZES.fontXs,
    fontWeight: '600',
  },
  orderItems: {
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderItemText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  moreItems: {
    fontSize: SIZES.fontSm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.sm,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderTotal: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '500',
  },
});
