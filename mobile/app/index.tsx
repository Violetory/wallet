import { StatusBar } from 'expo-status-bar';
import { Button } from 'react-native-paper';

import { ScreenContent } from 'components/ScreenContent';

export default function Index() {
  return (
    <>
      <ScreenContent title="Home" path="app/index.tsx">
        <Button mode="contained" onPress={() => {}}>
          Get started
        </Button>
      </ScreenContent>
      <StatusBar style="auto" />
    </>
  );
}
