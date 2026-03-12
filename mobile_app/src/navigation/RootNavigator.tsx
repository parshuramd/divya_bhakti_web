import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './types';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { useAppSelector, useAppDispatch, initializeAuth, loadCart, loadWishlist, loadTheme } from '../store';
import { useTheme } from '../hooks';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import { CartItem, Product } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    async function bootstrap() {
      dispatch(initializeAuth());

      const savedCart = await storage.get<CartItem[]>(STORAGE_KEYS.CART);
      if (savedCart?.length) dispatch(loadCart(savedCart));

      const savedWishlist = await storage.get<Product[]>(STORAGE_KEYS.WISHLIST);
      if (savedWishlist?.length) dispatch(loadWishlist(savedWishlist));

      const savedTheme = await storage.get<string>(STORAGE_KEYS.THEME);
      if (savedTheme) dispatch(loadTheme(savedTheme as any));
    }
    bootstrap();
  }, [dispatch]);

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
