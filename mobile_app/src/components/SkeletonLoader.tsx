import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES } from '../constants';

interface Props {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonLoader({
  width,
  height,
  borderRadius = SIZES.radiusSm,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <Animated.View style={styles.cardSkeleton}>
      <SkeletonLoader width="100%" height={160} borderRadius={SIZES.radiusMd} />
      <SkeletonLoader width="70%" height={14} style={{ marginTop: 10 }} />
      <SkeletonLoader width="40%" height={14} style={{ marginTop: 6 }} />
      <SkeletonLoader width="50%" height={16} style={{ marginTop: 8 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.skeleton,
  },
  cardSkeleton: {
    width: (SIZES.width - 48) / 2,
    marginBottom: SIZES.md,
    padding: SIZES.sm,
  },
});
