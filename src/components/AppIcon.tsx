import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ComponentProps, ReactNode } from 'react';
import { Platform } from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

type Props = {
  name: ComponentProps<typeof MaterialCommunityIcons>['name'];
  size: number;
  color: string;
};

/**
 * Shared icon wrapper. Web uses inline SVG paths so deployed icons never depend
 * on a separately hosted icon font. Native platforms keep MaterialCommunityIcons.
 */
export const AppIcon = ({ name, size, color }: Props) => {
  if (Platform.OS !== 'web') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden>
      {getWebIcon(name, color)}
    </Svg>
  );
};

const getWebIcon = (name: Props['name'], color: string): ReactNode => {
  switch (name) {
    case 'close':
      return <><Line x1="6" y1="6" x2="18" y2="18" /><Line x1="18" y1="6" x2="6" y2="18" /></>;
    case 'arrow-right':
      return <><Line x1="5" y1="12" x2="19" y2="12" /><Polyline points="13 6 19 12 13 18" /></>;
    case 'check':
      return <Polyline points="5 12 10 17 19 7" />;
    case 'check-circle':
    case 'checkbox-marked-circle':
      return <><Circle cx="12" cy="12" r="9" /><Polyline points="8 12 11 15 16.5 9" /></>;
    case 'close-circle':
      return <><Circle cx="12" cy="12" r="9" /><Line x1="9" y1="9" x2="15" y2="15" /><Line x1="15" y1="9" x2="9" y2="15" /></>;
    case 'checkbox-blank-outline':
      return <Rect x="4" y="4" width="16" height="16" rx="3" />;
    case 'eye':
      return <><Path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6S2.5 12 2.5 12Z" /><Circle cx="12" cy="12" r="2.5" /></>;
    case 'eye-off':
      return <><Path d="M4.5 7.5C3.2 8.7 2.5 10 2.5 12c0 0 3.5 6 9.5 6 1.5 0 2.9-.4 4.1-1" /><Path d="M9.4 6.4c.8-.3 1.7-.4 2.6-.4 6 0 9.5 6 9.5 6-.6 1-1.3 1.9-2.2 2.7" /><Line x1="4" y1="4" x2="20" y2="20" /></>;
    case 'play':
      return <Polygon points="8 5 19 12 8 19" fill={color} stroke="none" />;
    case 'history':
      return <><Path d="M4 10a8 8 0 1 1 2 7" /><Polyline points="4 4 4 10 10 10" /><Polyline points="12 8 12 12 15 14" /></>;
    case 'restart':
      return <><Path d="M4 10a8 8 0 1 1 1.8 7.1" /><Polyline points="4 4 4 10 10 10" /></>;
    case 'trophy-outline':
      return <><Path d="M8 4h8v4c0 3-1.8 5-4 5s-4-2-4-5V4Z" /><Path d="M8 6H4v2c0 2 1.5 3 4 3M16 6h4v2c0 2-1.5 3-4 3" /><Line x1="12" y1="13" x2="12" y2="18" /><Line x1="8" y1="20" x2="16" y2="20" /></>;
    case 'check-decagram-outline':
      return <><Polygon points="12 2.5 14.4 5.2 18 4.8 18.8 8.3 21.5 10.5 19.5 13.5 20.2 17 16.8 18 15 21 12 19.2 9 21 7.2 18 3.8 17 4.5 13.5 2.5 10.5 5.2 8.3 6 4.8 9.6 5.2" /><Polyline points="8.5 12 11 14.5 15.8 9.5" /></>;
    case 'lightbulb-on-outline':
      return <><Path d="M8.5 15.5C7 14.4 6 12.6 6 10.5a6 6 0 0 1 12 0c0 2.1-1 3.9-2.5 5L15 17H9l-.5-1.5Z" /><Line x1="9" y1="20" x2="15" y2="20" /><Line x1="10" y1="17" x2="10" y2="20" /><Line x1="14" y1="17" x2="14" y2="20" /></>;
    case 'home-outline':
      return <><Path d="M3 11 12 3l9 8" /><Path d="M5 10v10h14V10" /><Path d="M9 20v-6h6v6" /></>;
    case 'book-open-page-variant-outline':
      return <><Path d="M3 5.5c3-.8 6-.2 9 1.5v13c-3-1.7-6-2.3-9-1.5v-13Z" /><Path d="M21 5.5c-3-.8-6-.2-9 1.5v13c3-1.7 6-2.3 9-1.5v-13Z" /></>;
    case 'open-in-new':
      return <><Path d="M14 4h6v6" /><Line x1="20" y1="4" x2="10" y2="14" /><Path d="M19 13v7H4V5h7" /></>;
    default:
      return <Circle cx="12" cy="12" r="8" />;
  }
};
