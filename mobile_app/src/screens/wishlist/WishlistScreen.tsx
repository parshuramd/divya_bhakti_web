import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useAppSelector } from '../../store';
import { Product } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { ProductCard, EmptyState } from '../../components';

export default function WishlistScreen({ navigation }: any) {
  const wishlistItems = useAppSelector((state) => state.wishlist.items);

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

  return (
    <View style={styles.container}>
      <FlatList
        data={wishlistItems}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Your Wishlist is Empty"
            message="Save your favorite devotional items here"
            actionTitle="Explore Products"
            onAction={() => navigation.getParent()?.navigate('Home')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SIZES.md },
  productWrapper: { flex: 1 },
  leftCol: { paddingRight: 6 },
  rightCol: { paddingLeft: 6 },
});
