import React from 'react';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

type SafeScreenMode = 'full' | 'x-axis' | 'bottom';

type SafeScreenProps = {
  children: React.ReactNode;
  mode?: SafeScreenMode;
};

const edgesByMode: Record<SafeScreenMode, Edge[]> = {
  full: ['top', 'bottom', 'left', 'right'],
  'x-axis': ['left', 'right'],
  bottom: ['bottom', 'left', 'right'],
};

const SafeScreen = ({ children, mode = 'full' }: SafeScreenProps) => {
  return (
    <SafeAreaView edges={edgesByMode[mode]} style={{ flex: 1, paddingHorizontal: 16 }}>
      {children}
    </SafeAreaView>
  );
};

export default SafeScreen;
