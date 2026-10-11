import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  useFonts,
} from '@expo-google-fonts/montserrat';
import {
  RobotoMono_400Regular,
  RobotoMono_500Medium,
  RobotoMono_700Bold,
} from '@expo-google-fonts/roboto-mono';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MD3LightTheme, MD3Theme, PaperProvider } from 'react-native-paper';

import { Colors, Fonts } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { TrainingProvider } from '@/context/TrainingContext';
import { PasswordScreen } from '@/screens/PasswordScreen';

SplashScreen.preventAutoHideAsync();

const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    onPrimary: Colors.white,
    primaryContainer: Colors.primarySoft,
    onPrimaryContainer: Colors.primaryDark,
    background: Colors.background,
    surface: Colors.surface,
    surfaceVariant: Colors.surfaceMuted,
    outline: Colors.border,
    error: Colors.danger,
  },
  fonts: {
    ...MD3LightTheme.fonts,
    default: { ...MD3LightTheme.fonts.default, fontFamily: Fonts.regular, fontWeight: '400' },
    bodyLarge: { ...MD3LightTheme.fonts.bodyLarge, fontFamily: Fonts.regular, fontWeight: '400' },
    bodyMedium: { ...MD3LightTheme.fonts.bodyMedium, fontFamily: Fonts.regular, fontWeight: '400' },
    bodySmall: { ...MD3LightTheme.fonts.bodySmall, fontFamily: Fonts.regular, fontWeight: '400' },
    labelLarge: { ...MD3LightTheme.fonts.labelLarge, fontFamily: Fonts.medium, fontWeight: '500' },
    labelMedium: { ...MD3LightTheme.fonts.labelMedium, fontFamily: Fonts.medium, fontWeight: '500' },
    labelSmall: { ...MD3LightTheme.fonts.labelSmall, fontFamily: Fonts.medium, fontWeight: '500' },
    titleLarge: { ...MD3LightTheme.fonts.titleLarge, fontFamily: Fonts.bold, fontWeight: '700' },
    titleMedium: { ...MD3LightTheme.fonts.titleMedium, fontFamily: Fonts.bold, fontWeight: '700' },
    titleSmall: { ...MD3LightTheme.fonts.titleSmall, fontFamily: Fonts.bold, fontWeight: '700' },
    headlineLarge: { ...MD3LightTheme.fonts.headlineLarge, fontFamily: Fonts.bold, fontWeight: '700' },
    headlineMedium: { ...MD3LightTheme.fonts.headlineMedium, fontFamily: Fonts.bold, fontWeight: '700' },
    headlineSmall: { ...MD3LightTheme.fonts.headlineSmall, fontFamily: Fonts.bold, fontWeight: '700' },
  },
};

export default function RootLayout() {
  const [loaded, fontError] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    RobotoMono_400Regular,
    RobotoMono_500Medium,
    RobotoMono_700Bold,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (loaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [loaded, fontError]);

  if (!loaded && !fontError) {
    return (
      <PaperProvider theme={theme}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </PaperProvider>
    );
  }

  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <AppGate />
      </PaperProvider>
    </AuthProvider>
  );
}

function AppGate() {
  const { isAuthenticated, isChecking } = useAuth();

  if (isChecking) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0250b0" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <PasswordScreen />;
  }

  return (
    <TrainingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      />
    </TrainingProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
