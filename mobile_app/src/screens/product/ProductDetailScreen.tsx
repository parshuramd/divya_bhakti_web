import React, { useEffect, useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  useAppDispatch,
  useAppSelector,
  fetchProductDetail,
  clearCurrentProduct,
  addToCart,
  toggleWishlist,
  selectIsInWishlist,
} from '../../store';
import { Product, ProductImage } from '../../types';
import { COLORS, SIZES, SHADOWS } from '../../constants';
import { formatPrice, getDiscountPercent } from '../../utils/format';
import { LoadingSpinner, CustomButton, QuantityStepper } from '../../components';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading } = useAppSelector((state) => state.products);
  const isWishlisted = useAppSelector(selectIsInWishlist(productId));
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    dispatch(fetchProductDetail(productId));
    return () => { dispatch(clearCurrentProduct()); };
  }, [dispatch, productId]);

  const handleAddToCart = useCallback(() => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      Alert.alert('Added to Cart', `${product.name} x${quantity} added to your cart`, [
        { text: 'Continue Shopping', style: 'cancel' },
        {
          text: 'View Cart',
          onPress: () => navigation.getParent()?.navigate('Cart'),
        },
      ]);
    }
  }, [dispatch, product, quantity, navigation]);

  const handleBuyNow = useCallback(() => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      navigation.getParent()?.navigate('Cart', { screen: 'Checkout' });
    }
  }, [dispatch, product, quantity, navigation]);

  const handleToggleWishlist = useCallback(() => {
    if (product) dispatch(toggleWishlist(product));
  }, [dispatch, product]);

  const renderImage = useCallback(
    ({ item }: { item: ProductImage }) => (
      <Image
        source={{ uri: item.url }}
        style={styles.productImage}
        resizeMode="cover"
      />
    ),
    []
  );

  if (isLoading || !product) return <LoadingSpinner fullScreen />;

  const discount = getDiscountPercent(product.price, product.compareAtPrice || 0);
  const outOfStock = product.stock <= 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Carousel */}
        <View style={styles.imageCarousel}>
          <FlatList
            ref={flatListRef}
            data={product.images}
            renderItem={renderImage}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
            }}
          />
          {product.images.length > 1 && (
            <View style={styles.imagePagination}>
              {product.images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImageIndex && styles.activeDot]} />
              ))}
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
          <TouchableOpacity style={styles.wishlistBtn} onPress={handleToggleWishlist}>
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={24}
              color={isWishlisted ? COLORS.error : COLORS.text}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.nameMarathi && (
            <Text style={styles.nameMarathi}>{product.nameMarathi}</Text>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</Text>
            )}
            {discount > 0 && <Text style={styles.savingsText}>Save {discount}%</Text>}
          </View>

          {product.averageRating ? (
            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < Math.round(product.averageRating!) ? 'star' : 'star-outline'}
                  size={16}
                  color={COLORS.rating}
                />
              ))}
              <Text style={styles.ratingText}>
                {product.averageRating.toFixed(1)} ({product._count?.reviews || 0} reviews)
              </Text>
            </View>
          ) : null}

          {/* Stock Status */}
          <View style={styles.stockRow}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: outOfStock ? '#FEF2F2' : '#F0FDF4' },
              ]}
            >
              <View
                style={[
                  styles.stockDot,
                  { backgroundColor: outOfStock ? COLORS.error : COLORS.success },
                ]}
              />
              <Text
                style={[
                  styles.stockText,
                  { color: outOfStock ? COLORS.error : COLORS.success },
                ]}
              >
                {outOfStock ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity */}
        {!outOfStock && (
          <View style={styles.quantitySection}>
            <Text style={styles.sectionLabel}>Quantity</Text>
            <QuantityStepper
              quantity={quantity}
              maxQuantity={product.stock}
              onIncrement={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </View>
        )}

        {/* Description */}
        {product.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>
        )}

        {/* Product Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          {product.sku && (
            <DetailRow label="SKU" value={product.sku} />
          )}
          {product.category && (
            <DetailRow label="Category" value={product.category.name} />
          )}
          {product.weight && (
            <DetailRow label="Weight" value={`${product.weight}g`} />
          )}
          {product.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {product.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, SHADOWS.lg]}>
        <CustomButton
          title="Add to Cart"
          onPress={handleAddToCart}
          variant="outline"
          icon="cart-outline"
          disabled={outOfStock}
          style={styles.cartButton}
        />
        <CustomButton
          title="Buy Now"
          onPress={handleBuyNow}
          disabled={outOfStock}
          icon="flash-outline"
          style={styles.buyButton}
        />
      </View>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageCarousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
    backgroundColor: COLORS.surface,
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.85,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 20,
    backgroundColor: '#fff',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: COLORS.error,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
  },
  discountText: {
    color: '#fff',
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  wishlistBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: SIZES.md,
  },
  productName: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 28,
  },
  nameMarathi: {
    fontSize: SIZES.fontLg,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
    gap: 8,
  },
  price: {
    fontSize: SIZES.fontTitle,
    fontWeight: '800',
    color: COLORS.primary,
  },
  comparePrice: {
    fontSize: SIZES.fontLg,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: SIZES.fontSm,
    color: COLORS.success,
    fontWeight: '600',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SIZES.sm,
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  stockRow: {
    marginTop: SIZES.md,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusSm,
    gap: 6,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  descriptionSection: {
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  descriptionText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  detailsSection: {
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  detailLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SIZES.sm,
    gap: 6,
  },
  tag: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: SIZES.md,
    paddingBottom: SIZES.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 12,
  },
  cartButton: {
    flex: 1,
  },
  buyButton: {
    flex: 1,
  },
});
