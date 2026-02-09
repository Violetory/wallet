import type * as React from 'react';
import type { TextProps, ViewProps } from 'react-native';

declare module 'react-native' {
  interface View extends React.Component<ViewProps> {}
  interface Text extends React.Component<TextProps> {}
}
