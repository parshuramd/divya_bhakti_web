import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../../types';
import { orderService } from '../../services/orderService';
import { COLORS, SIZES, SHADOWS } from '../../constants';
import { LoadingSpinner, EmptyState, CustomButton } from '../../components';

export default function AddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAddresses = useCallback(async () => {
    try {
      const data = await orderService.getAddresses();
      setAddresses(data);
    } catch {
      // handle silently
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadAddresses);
    return unsubscribe;
  }, [navigation, loadAddresses]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await orderService.deleteAddress(id);
            setAddresses((prev) => prev.filter((a) => a.id !== id));
          } catch {
            Alert.alert('Error', 'Failed to delete address');
          }
        },
      },
    ]);
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, SHADOWS.sm]}>
      <View style={styles.addressHeader}>
        <View style={styles.addressType}>
          <Ionicons
            name={item.type === 'HOME' ? 'home-outline' : item.type === 'OFFICE' ? 'business-outline' : 'location-outline'}
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.addressTypeLabel}>{item.type}</Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      <Text style={styles.addressName}>{item.fullName}</Text>
      <Text style={styles.addressText}>
        {item.addressLine1}{item.addressLine2 ? `, ${item.addressLine2}` : ''}
      </Text>
      <Text style={styles.addressText}>
        {item.city}, {item.state} - {item.pincode}
      </Text>
      <Text style={styles.addressPhone}>{item.phone}</Text>
      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('AddAddress', { address: item })}
        >
          <Ionicons name="create-outline" size={16} color={COLORS.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
          <Text style={[styles.actionText, { color: COLORS.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAddresses(); }} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="location-outline" title="No Addresses" message="Add your first delivery address" />
        }
        ListFooterComponent={
          <CustomButton
            title="Add New Address"
            onPress={() => navigation.navigate('AddAddress', {})}
            variant="outline"
            fullWidth
            icon="add-outline"
            style={{ marginHorizontal: SIZES.md, marginTop: SIZES.md }}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  list: { padding: SIZES.md, paddingBottom: SIZES.xxl },
  addressCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  addressType: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressTypeLabel: { fontSize: SIZES.fontSm, color: COLORS.primary, fontWeight: '600' },
  defaultBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: { fontSize: SIZES.fontXs, color: COLORS.success, fontWeight: '600' },
  addressName: { fontSize: SIZES.fontLg, fontWeight: '600', color: COLORS.text },
  addressText: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, lineHeight: 20 },
  addressPhone: { fontSize: SIZES.fontMd, color: COLORS.text, fontWeight: '500', marginTop: 4 },
  addressActions: {
    flexDirection: 'row',
    gap: SIZES.lg,
    marginTop: SIZES.md,
    paddingTop: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: SIZES.fontMd, color: COLORS.primary, fontWeight: '500' },
});
