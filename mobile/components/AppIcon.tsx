import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as React from 'react';

export type AppIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type AppIconProps = React.ComponentProps<typeof MaterialCommunityIcons>;

export default function AppIcon({ size = 18, color = '#191919', ...props }: AppIconProps) {
  return <MaterialCommunityIcons size={size} color={color} {...props} />;
}
