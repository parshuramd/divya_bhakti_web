import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Banner } from '../types';
import { COLORS, SIZES } from '../constants';

interface Props {
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;
const BANNER_HEIGHT = 170;
const AUTO_SCROLL_INTERVAL = 4000;

function BannerSlider({ banners, onBannerPress }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoScroll = useCallback(() => {
    if (banners.length <= 1) return;
    autoScrollRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToOffset({
          offset: next * (BANNER_WIDTH + 12),
          animated: true,
        });
        return next;
      });
    }, AUTO_SCROLL_INTERVAL);
  }, [banners.length]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [startAutoScroll]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12));
      if (index !== activeIndex) setActiveIndex(index);
    },
    [activeIndex]
  );

  const onScrollBeginDrag = useCallback(() => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
  }, []);

  const onScrollEndDrag = useCallback(() => {
    startAutoScroll();
  }, [startAutoScroll]);

  const renderBanner = useCallback(
    ({ item }: { item: Banner }) => (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onBannerPress?.(item)}
        style={styles.bannerItem}
      >
        <Image
          source={{ uri: item.imageMobile || item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          )}
          {item.linkText && (
            <View style={styles.ctaButton}>
              <Text style={styles.ctaText}>{item.linkText}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    ),
    [onBannerPress]
  );

  if (!banners.length) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        renderItem={renderBanner}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        scrollEventThrottle={16}
        snapToInterval={BANNER_WIDTH + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
      />
      {banners.length > 1 && (
        <View style={styles.pagination}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === activeIndex && styles.activeDot]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default memo(BannerSlider);

const styles = StyleSheet.create({
  container: {
    marginTop: SIZES.md,
  },
  listContent: {
    paddingHorizontal: SIZES.md,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end',
    padding: SIZES.md,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: SIZES.fontSm,
    marginTop: 2,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
    marginTop: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.sm,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderLight,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
  },
});
