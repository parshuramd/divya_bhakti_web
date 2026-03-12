import { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Home stack
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetail: { productId: string; productName?: string };
  ProductList: { categoryId?: string; categoryName?: string; search?: string };
  Search: undefined;
};

// Categories stack
export type CategoriesStackParamList = {
  CategoriesScreen: undefined;
  CategoryProducts: { categoryId: string; categoryName: string; categorySlug: string };
  ProductDetail: { productId: string; productName?: string };
};

// Cart stack
export type CartStackParamList = {
  CartScreen: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string; orderNumber: string };
};

// Orders stack
export type OrdersStackParamList = {
  OrdersScreen: undefined;
  OrderDetail: { orderId: string; orderNumber?: string };
  TrackOrder: { orderNumber?: string };
};

// Profile stack
export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  AddAddress: { address?: any };
  Wishlist: undefined;
  Settings: undefined;
  ProductDetail: { productId: string; productName?: string };
};

// Main tab navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Categories: NavigatorScreenParams<CategoriesStackParamList>;
  Cart: NavigatorScreenParams<CartStackParamList>;
  Orders: NavigatorScreenParams<OrdersStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Root navigator
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Screen prop types for easy typing in screen components
export type HomeScreenProps = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ProductDetailScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProductDetail'
>;

export type ProductListScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ProductList'
>;

export type CartScreenProps = NativeStackScreenProps<CartStackParamList, 'CartScreen'>;

export type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

export type OrdersScreenProps = NativeStackScreenProps<
  OrdersStackParamList,
  'OrdersScreen'
>;

export type OrderDetailScreenProps = NativeStackScreenProps<
  OrdersStackParamList,
  'OrderDetail'
>;

export type ProfileScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, 'ProfileScreen'>,
  BottomTabScreenProps<MainTabParamList>
>;
