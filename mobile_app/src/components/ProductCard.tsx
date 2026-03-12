import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SIZES, SHADOWS } from '../constants';
import { formatPrice, getDiscountPercent, truncateText } from '../utils/format';
import { useAppDispatch, useAppSelector, addToCart, toggleWishlist, selectIsInWishlist } from '../store';

interface Props {
  product: Product;
  onPress: (product: Product) => void;
  horizontal?: boolean;
}

function ProductCard({ product, onPress, horizontal = false }: Props) {
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector(selectIsInWishlist(product.id));
  const primaryImage = product.images?.find((img) => img.isPrimary) || product.images?.[0];
  const discount = getDiscountPercent(product.price, product.compareAtPrice || 0);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = useCallback(() => {
    if (!outOfStock) dispatch(addToCart({ product }));
  }, [dispatch, product, outOfStock]);

  const handleToggleWishlist = useCallback(() => {
    dispatch(toggleWishlist(product));
  }, [dispatch, product]);

  if (horizontal) {
    return (
      <TouchableOpacity
        style={[styles.horizontalCard, SHADOWS.sm]}
        onPress={() => onPress(product)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: primaryImage?.url || 'https://via.placeholder.com/120' }}
          style={styles.horizontalImage}
          resizeMode="cover"
        />
        <View style={styles.horizontalInfo}>
          <Text style={styles.name} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</Text>
            )}
          </View>
          {product.averageRating ? (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color={COLORS.rating} />
              <Text style={styles.ratingText}>{product.averageRating.toFixed(1)}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.sm]}
      onPress={() => onPress(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: primaryImage?.url || 'https://via.placeholder.com/200' }}
          style={styles.image}
          resizeMode="cover"
        />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={handleToggleWishlist}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={20}
            color={isWishlisted ? COLORS.error : COLORS.textTertiary}
          />
        </TouchableOpacity>
        {outOfStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {truncateText(product.name, 40)}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <Text style={styles.comparePrice}>{formatPrice(product.compareAtPrice)}</Text>
          )}
        </View>

        {product.averageRating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color={COLORS.rating} />
            <Text style={styles.ratingText}>
              {product.averageRating.toFixed(1)}
              {product._count?.reviews ? ` (${product._count.reviews})` : ''}
            </Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.addToCartBtn, outOfStock && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={outOfStock}
        >
          <Ionicons name="cart-outline" size={14} color="#fff" />
          <Text style={styles.addToCartText}>Add</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ProductCard);

const CARD_WIDTH = (SIZES.width - 48) / 2;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: SIZES.fontMd,
  },
  info: {
    padding: SIZES.sm,
  },
  name: {
    fontSize: SIZES.fontSm,
    fontWeight: '500',
    color: COLORS.text,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  price: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.primary,
  },
  comparePrice: {
    fontSize: SIZES.fontSm,
    color: COLORS.textTertiary,
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  ratingText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSm,
    paddingVertical: 6,
    marginTop: 8,
    gap: 4,
  },
  addToCartDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  addToCartText: {
    color: '#fff',
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  // Horizontal variant
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
    marginHorizontal: SIZES.md,
  },
  horizontalImage: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.surface,
  },
  horizontalInfo: {
    flex: 1,
    padding: SIZES.sm,
    justifyContent: 'center',
  },
});
