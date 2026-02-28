import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView
        edges={['top', 'bottom', 'left', 'right']}
        style={{ flex: 1, paddingHorizontal: 16 }}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeScreen;