import { Slot } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import SafeScreen from 'components/SafeScreen';
import '../global.css';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#fff',
  },
};

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Set it in mobile/.env.local and restart Expo.'
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <SafeScreen>
          <Slot />
        </SafeScreen>
      </ClerkProvider>
    </PaperProvider>
  );
}
