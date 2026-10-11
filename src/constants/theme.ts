import { Platform } from 'react-native';

// Auf Web: CSS-Fontname (aus Google Fonts). Auf Native: JS-Fontname (aus expo-google-fonts).
const isWeb = Platform.OS === 'web';

export const Fonts = {
  regular: isWeb ? 'Montserrat' : 'Montserrat_400Regular',
  medium: isWeb ? 'Montserrat' : 'Montserrat_500Medium',
  semibold: isWeb ? 'Montserrat' : 'Montserrat_600SemiBold',
  bold: isWeb ? 'Montserrat' : 'Montserrat_700Bold',
  mono: isWeb ? 'Roboto Mono' : 'RobotoMono_400Regular',
  monoMedium: isWeb ? 'Roboto Mono' : 'RobotoMono_500Medium',
  monoBold: isWeb ? 'Roboto Mono' : 'RobotoMono_700Bold',
};

export const Colors = {
  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F5F9',
  primary: '#155EEF',
  primaryDark: '#16468C',
  primarySoft: '#EAF1FF',
  accent: '#08A7C2',
  text: '#17233C',
  textMuted: '#667085',
  border: '#E3E9F2',
  success: '#248A5A',
  successSoft: '#EAF7F0',
  danger: '#C2414B',
  dangerSoft: '#FCEDEF',
  infoSoft: '#EAF6FA',
  white: '#FFFFFF',
};

export const Layout = {
  actionMaxWidth: 300,
  controlHeight: 54,
  minTouchTarget: 44,
};
