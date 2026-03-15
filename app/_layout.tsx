import {
  FiraSans_400Regular,
  FiraSans_500Medium,
  FiraSans_700Bold,
  useFonts,
} from '@expo-google-fonts/fira-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import { TrainingProvider } from '@/context/TrainingContext';
import { Fonts } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0250b0',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: { ...MD3LightTheme.fonts.default, fontFamily: Fonts.regular },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: Fonts.regular },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: Fonts.regular },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: Fonts.regular },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: Fonts.medium },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: Fonts.medium },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: Fonts.medium },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: Fonts.bold },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: Fonts.bold },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: Fonts.bold },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: Fonts.bold },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: Fonts.bold },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: Fonts.bold },
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    FiraSans_400Regular,
    FiraSans_500Medium,
    FiraSans_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TrainingProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </TrainingProvider>
  );
}
