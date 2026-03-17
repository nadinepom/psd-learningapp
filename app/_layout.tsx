import {
  FiraSans_400Regular,
  FiraSans_500Medium,
  FiraSans_700Bold,
  useFonts,
} from '@expo-google-fonts/fira-sans';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { TrainingProvider } from '@/context/TrainingContext';

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

  if (!loaded) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <TrainingProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </TrainingProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
