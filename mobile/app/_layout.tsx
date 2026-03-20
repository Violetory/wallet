import { Slot } from 'expo-router';
import { Text, View } from 'react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { ClerkProvider } from '@clerk/clerk-expo/dist/provider/ClerkProvider';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import '../global.css';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#fff',
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    return (
      <PaperProvider theme={theme}>
        <View className="flex-1 items-center justify-center gap-3 bg-white px-6">
          <Text className="text-center text-2xl font-bold text-[#1F2937]">Missing Clerk Key</Text>
          <Text className="text-center text-base leading-6 text-[#4B5563]">
            Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in mobile/.env.local and restart Expo.
          </Text>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Slot />
      </ClerkProvider>
    </PaperProvider>
  );
}