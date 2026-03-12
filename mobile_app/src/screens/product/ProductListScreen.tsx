import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector, fetchProducts, clearProducts } from '../../store';
import { Product } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { ProductCard, LoadingSpinner, EmptyState, ProductCardSkeleton } from '../../components';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function ProductListScreen({ route, navigation }: any) {
  const dispatch = useAppDispatch();
  const { products, isLoading, isLoadingMore, page, totalPages } = useAppSelector(
    (state) => state.products
  );
  const categoryId = route.params?.categoryId;
  const [sort, setSort] = useState('newest');
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    dispatch(clearProducts());
    dispatch(fetchProducts({ categoryId, sort }));
    return () => { dispatch(clearProducts()); };
  }, [dispatch, categoryId, sort]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && page < totalPages) {
      dispatch(fetchProducts({ categoryId, sort, page: page + 1, append: true }));
    }
  }, [dispatch, categoryId, sort, page, totalPages, isLoadingMore]);

  const navigateToProduct = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', {
        productId: product.id,
        productName: product.name,
      });
    },
    [navigation]
  );

  const renderProduct = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <View style={[styles.productWrapper, index % 2 === 0 ? styles.leftCol : styles.rightCol]}>
        <ProductCard product={item} onPress={navigateToProduct} />
      </View>
    ),
    [navigateToProduct]
  );

  const renderFooter = useMemo(
    () =>
      isLoadingMore ? (
        <View style={styles.footer}>
          <LoadingSpinner size="small" />
        </View>
      ) : null,
    [isLoadingMore]
  );

  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Sort';

  return (
    <View style={styles.container}>
      {/* Sort / Filter bar */}
      <View style={styles.toolbar}>
        <Text style={styles.resultCount}>
          {products.length} product{products.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="swap-vertical-outline" size={16} color={COLORS.primary} />
          <Text style={styles.sortText}>{currentSortLabel}</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !products.length ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <EmptyState
              icon="cube-outline"
              title="No products found"
              message="Try a different category or check back later"
            />
          }
        />
      )}

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.sortOption, sort === option.value && styles.sortOptionActive]}
                onPress={() => {
                  setSort(option.value);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sort === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {sort === option.value && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  list: {
    padding: SIZES.md,
  },
  productWrapper: {
    flex: 1,
  },
  leftCol: {
    paddingRight: 6,
  },
  rightCol: {
    paddingLeft: 6,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SIZES.md,
    gap: 12,
  },
  footer: {
    paddingVertical: SIZES.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  modalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sortOptionActive: {
    backgroundColor: '#FFF3E0',
    marginHorizontal: -SIZES.lg,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusSm,
  },
  sortOptionText: {
    fontSize: SIZES.fontLg,
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
