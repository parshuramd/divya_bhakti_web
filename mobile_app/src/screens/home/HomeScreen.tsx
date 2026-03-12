import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreenProps } from '../../navigation/types';
import {
  useAppDispatch,
  useAppSelector,
  fetchBanners,
  fetchCategories,
  fetchFeaturedProducts,
} from '../../store';
import { Product, Category } from '../../types';
import { COLORS, SIZES, CONFIG } from '../../constants';
import {
  BannerSlider,
  ProductCard,
  CategoryCard,
  SectionHeader,
  SearchBar,
  ProductCardSkeleton,
} from '../../components';

const DAILY_QUOTES = [
  'Jai Shree Ram! Start your day with devotion.',
  'Om Namah Shivaya — May peace be with you.',
  'Bhakti is the path to eternal bliss.',
  'Serve with love, live with purpose.',
  'Har Har Mahadev! Embrace the divine within.',
];

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { banners, categories, featuredProducts, isLoading } = useAppSelector(
    (state) => state.products
  );
  const user = useAppSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const quote = DAILY_QUOTES[new Date().getDay() % DAILY_QUOTES.length];

  const loadData = useCallback(() => {
    dispatch(fetchBanners());
    dispatch(fetchCategories());
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  }, [loadData]);

  const navigateToProduct = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', {
        productId: product.id,
        productName: product.name,
      });
    },
    [navigation]
  );

  const navigateToCategory = useCallback(
    (category: Category) => {
      navigation.navigate('ProductList', {
        categoryId: category.id,
        categoryName: category.name,
      });
    },
    [navigation]
  );

  const renderFeaturedProduct = useCallback(
    ({ item }: { item: Product }) => (
      <View style={styles.featuredCardWrapper}>
        <ProductCard product={item} onPress={navigateToProduct} />
      </View>
    ),
    [navigateToProduct]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.name ? `Namaste, ${user.name.split(' ')[0]}` : 'Namaste'}
          </Text>
          <Text style={styles.headerTitle}>{CONFIG.APP_NAME}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => {}}
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar onPress={() => navigation.navigate('Search')} editable={false} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Daily Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteIcon}>🙏</Text>
          <Text style={styles.quoteText}>{quote}</Text>
        </View>

        {/* Banners */}
        <BannerSlider banners={banners} />

        {/* Categories */}
        <SectionHeader
          title="Shop by Category"
          actionText="View All"
          onAction={() => navigation.getParent()?.navigate('Categories')}
        />
        <View style={styles.categoryGrid}>
          {categories.slice(0, 8).map((cat) => (
            <CategoryCard key={cat.id} category={cat} onPress={navigateToCategory} compact />
          ))}
        </View>

        {/* Featured Products */}
        <SectionHeader
          title="Featured Products"
          subtitle="Handpicked devotional items"
          actionText="See All"
          onAction={() => navigation.navigate('ProductList', { categoryName: 'Featured' })}
        />
        {isLoading && !featuredProducts.length ? (
          <View style={styles.skeletonRow}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : (
          <FlatList
            data={featuredProducts}
            renderItem={renderFeaturedProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            snapToInterval={(SIZES.width - 48) / 2 + 12}
            decelerationRate="fast"
          />
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  greeting: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: SIZES.fontXxl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.md,
    marginTop: SIZES.md,
    backgroundColor: '#FFF8E1',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    gap: 10,
  },
  quoteIcon: {
    fontSize: 24,
  },
  quoteText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.md,
    justifyContent: 'space-between',
  },
  horizontalList: {
    paddingHorizontal: SIZES.md,
    gap: 12,
  },
  featuredCardWrapper: {
    width: (SIZES.width - 48) / 2,
  },
  skeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: 12,
  },
  bottomSpacer: {
    height: SIZES.xl,
  },
});
