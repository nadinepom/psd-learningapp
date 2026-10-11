import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps } from 'react';

type Props = {
  name: ComponentProps<typeof MaterialCommunityIcons>['name'];
  size: number;
  color: string;
};

/**
 * Shared icon wrapper. MaterialCommunityIcons.font is loaded in app/_layout.tsx,
 * so the same vector glyphs render consistently on web, iOS, and Android.
 */
export const AppIcon = ({ name, size, color }: Props) => (
  <MaterialCommunityIcons name={name} size={size} color={color} />
);
