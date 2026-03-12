import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector, searchProducts, clearSearch } from '../../store';
import { useDebounce } from '../../hooks';
import { Product } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { SearchBar, ProductCard, EmptyState, LoadingSpinner } from '../../components';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

export default function SearchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { searchResults, isSearching } = useAppSelector((state) => state.products);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  React.useEffect(() => {
    if (debouncedQuery.length >= 2) {
      dispatch(searchProducts(debouncedQuery));
    } else {
      dispatch(clearSearch());
    }
  }, [debouncedQuery, dispatch]);

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
    ({ item }: { item: Product }) => (
      <ProductCard product={item} onPress={navigateToProduct} horizontal />
    ),
    [navigateToProduct]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.searchWrapper}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            autoFocus
            onSubmit={() => {
              if (query.length >= 2) dispatch(searchProducts(query));
            }}
          />
        </View>
      </View>

      {isSearching ? (
        <LoadingSpinner message="Searching..." />
      ) : query.length < 2 ? (
        <View style={styles.hintContainer}>
          <Ionicons name="search" size={48} color={COLORS.textTertiary} />
          <Text style={styles.hintText}>Type at least 2 characters to search</Text>
        </View>
      ) : searchResults.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="No results found"
          message={`We couldn't find any products matching "${query}"`}
        />
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    alignItems: 'center',
    paddingRight: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  backBtn: {
    paddingHorizontal: SIZES.md,
  },
  searchWrapper: {
    flex: 1,
  },
  hintContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.md,
  },
  hintText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textTertiary,
  },
  resultsList: {
    paddingVertical: SIZES.sm,
  },
});
