import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoriesStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector, fetchCategories } from '../../store';
import { Category } from '../../types';
import { COLORS, SIZES } from '../../constants';
import { CategoryCard, LoadingSpinner, EmptyState } from '../../components';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'CategoriesScreen'>;

export default function CategoriesScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { categories, isLoading } = useAppSelector((state) => state.products);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchCategories());
    setTimeout(() => setRefreshing(false), 1000);
  }, [dispatch]);

  const handleCategoryPress = useCallback(
    (category: Category) => {
      navigation.navigate('CategoryProducts', {
        categoryId: category.id,
        categoryName: category.name,
        categorySlug: category.slug,
      });
    },
    [navigation]
  );

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => (
      <CategoryCard category={item} onPress={handleCategoryPress} />
    ),
    [handleCategoryPress]
  );

  if (isLoading && !categories.length) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <FlatList
        data={categories.filter((c) => c.isActive)}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <EmptyState icon="grid-outline" title="No categories" message="Categories will appear here" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    paddingVertical: SIZES.md,
  },
});
