import React from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
        edges={['top', 'bottom', 'left', 'right']}
        style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' }}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeScreen;