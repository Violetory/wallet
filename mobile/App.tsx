import './global.css';
import { StyleSheet, View } from 'react-native';
import { Button, MD3LightTheme, PaperProvider, Text } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
  }
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text variant="headlineMedium">React Native Paper Ready</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Material Design components are now available.
        </Text>
        <Button mode="contained" onPress={() => {}} style={styles.button}>
          Get started
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: 8,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center'
  },
  button: {
    marginTop: 16
  }
});
