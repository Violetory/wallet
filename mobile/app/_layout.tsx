import { Stack } from 'expo-router';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import SafeScreen from 'components/SafeScreen';
import '../global.css';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    background: '#fff',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <SafeScreen>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        />
      </SafeScreen>
    </PaperProvider>
  );
}
