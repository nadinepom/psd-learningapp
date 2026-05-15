import { Platform } from 'react-native';

// Auf Web: CSS-Fontname (aus Google Fonts). Auf Native: JS-Fontname (aus expo-google-fonts).
const isWeb = Platform.OS === 'web';

export const Fonts = {
  regular: isWeb ? 'Fira Sans' : 'FiraSans_400Regular',
  medium: isWeb ? 'Fira Sans' : 'FiraSans_500Medium',
  bold: isWeb ? 'Fira Sans' : 'FiraSans_700Bold',
};
