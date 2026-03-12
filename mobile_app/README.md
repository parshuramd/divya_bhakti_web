# Divya Bhakti Store - Mobile App

A production-ready React Native ecommerce mobile application for devotional and spiritual products.

## Tech Stack

- **React Native** with **Expo** (SDK 55)
- **TypeScript** for type safety
- **React Navigation v6** (Bottom Tabs + Native Stacks)
- **Redux Toolkit** for state management
- **Axios** for API communication
- **Expo Notifications** for push notifications
- **AsyncStorage** for offline persistence
- **React Native Gesture Handler** + **Reanimated**

## Prerequisites

- Node.js >= 18
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your physical device (iOS/Android)
- Or Xcode (iOS Simulator) / Android Studio (Android Emulator)

## Getting Started

### 1. Install Dependencies

```bash
cd mobile_app
npm install
```

### 2. Configure Environment

Update `app.json` → `expo.extra` with your API credentials:

```json
{
  "extra": {
    "apiBaseUrl": "https://your-api-domain.com/api",
    "razorpayKeyId": "rzp_live_xxxxxxxxxxxxx"
  }
}
```

### 3. Run the App

```bash
# Start the development server
npx expo start

# Run on iOS Simulator
npx expo run:ios

# Run on Android Emulator
npx expo run:android

# Run on physical device (scan QR with Expo Go)
npx expo start --tunnel
```

## Project Structure

```
src/
├── assets/          # Images, animations, fonts
├── components/      # Reusable UI components
│   ├── BannerSlider.tsx
│   ├── CategoryCard.tsx
│   ├── CustomButton.tsx
│   ├── EmptyState.tsx
│   ├── LoadingSpinner.tsx
│   ├── ProductCard.tsx
│   ├── QuantityStepper.tsx
│   ├── SearchBar.tsx
│   ├── SectionHeader.tsx
│   └── SkeletonLoader.tsx
├── constants/       # Theme, config, storage keys
├── hooks/           # Custom React hooks
├── navigation/      # React Navigation setup
│   ├── AuthStack.tsx
│   ├── HomeStack.tsx
│   ├── CategoriesStack.tsx
│   ├── CartStack.tsx
│   ├── OrdersStack.tsx
│   ├── ProfileStack.tsx
│   ├── MainTabs.tsx
│   └── RootNavigator.tsx
├── screens/         # Screen components
│   ├── auth/
│   ├── home/
│   ├── product/
│   ├── cart/
│   ├── checkout/
│   ├── orders/
│   ├── profile/
│   ├── wishlist/
│   └── categories/
├── services/        # API service layer
│   ├── api.ts
│   ├── authService.ts
│   ├── productService.ts
│   ├── orderService.ts
│   └── notificationService.ts
├── store/           # Redux Toolkit store
│   ├── store.ts
│   ├── authSlice.ts
│   ├── cartSlice.ts
│   ├── productSlice.ts
│   ├── wishlistSlice.ts
│   └── themeSlice.ts
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Features

### Authentication
- Email/Password login & registration
- OTP-based login (prepared)
- Forgot password flow
- Persistent login with AsyncStorage

### Shopping
- Banner slider on home screen
- Category-based product browsing
- Product search with debounce
- Infinite scroll product listing
- Sort & filter products
- Product detail with image carousel
- Ratings & reviews display

### Cart & Checkout
- Add/remove products with quantity control
- Offline-first cart (persisted to AsyncStorage)
- Coupon code support
- Address management (CRUD)
- Razorpay payment integration (online)
- Cash on Delivery support
- Order confirmation flow

### Orders
- Order history list
- Order detail with timeline
- Order tracking (external link)

### Profile
- Edit profile (name, phone)
- Address management
- Wishlist
- Dark mode / Light mode / System theme
- Settings & about

### Performance
- FlatList with proper key extraction
- React.memo on list items (ProductCard, CategoryCard)
- Skeleton loading states
- Pull-to-refresh
- Infinite scroll with pagination

## Razorpay Integration

For production Razorpay, install the native SDK:

```bash
npm install react-native-razorpay
npx expo prebuild
```

Then update `CheckoutScreen.tsx` to use `RazorpayCheckout.open(options)`.

## Push Notifications

The app uses **Expo Notifications** with push token registration. For Firebase Cloud Messaging:

1. Create a Firebase project
2. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
3. Place them in the project root
4. Update `app.json` with the `googleServicesFile` path

## Building for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Theme Colors

| Color    | Hex       | Usage        |
|----------|-----------|--------------|
| Primary  | `#FF7A00` | Saffron      |
| Secondary| `#FFD700` | Gold accents |
| Background| `#FFFFFF`| White        |
| Text     | `#1A1A1A` | Dark text    |
| Success  | `#22C55E` | Green        |
| Error    | `#EF4444` | Red          |

## License

Private - Divya Bhakti Store
