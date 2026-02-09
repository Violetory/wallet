import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';
import { ScreenContent } from 'components/ScreenContent';

export default function Index() {
  return (
    <View>
      <Button mode="contained" onPress={() => {}}>
        Get started
      </Button>
    </View>
  );
}
