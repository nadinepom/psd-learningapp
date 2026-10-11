import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { Colors, Fonts, Layout } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export const PasswordScreen = () => {
  const { width } = useWindowDimensions();
  const { unlock } = useAuth();
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError(false);
    const success = await unlock(password);
    if (!success) {
      setError(true);
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.card, { width: Math.min(420, width - 40) }]}>
        <View style={styles.logoFrame}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.eyebrow}>WELCOME BACK</Text>
        <Text variant="headlineSmall" style={styles.title}>Your learning space</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Enter your password to continue your training.
        </Text>

        <TextInput
          label="Password"
          mode="outlined"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError(false);
          }}
          secureTextEntry={secure}
          right={
            <TextInput.Icon
              icon={({ size, color }) => (
                <AppIcon name={secure ? 'eye' : 'eye-off'} size={size} color={color} />
              )}
              onPress={() => setSecure((s) => !s)}
            />
          }
          error={error}
          onSubmitEditing={handleSubmit}
          returnKeyType="done"
          autoCapitalize="none"
          style={styles.input}
          outlineColor={Colors.border}
          activeOutlineColor={Colors.primary}
          textColor={Colors.text}
        />

        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            Incorrect password. Please try again.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || password.length === 0}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}>
          Unlock
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  card: {
    boxSizing: 'border-box',
    alignItems: 'stretch',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 32,
    maxWidth: 420,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.07,
    shadowRadius: 30,
    elevation: 3,
  },
  logoFrame: {
    alignSelf: 'center',
    width: 88,
    height: 88,
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  eyebrow: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    textAlign: 'center',
    color: Colors.text,
    fontSize: 26,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: Colors.textMuted,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 28,
  },
  input: {
    backgroundColor: Colors.surface,
    marginBottom: 6,
  },
  errorText: {
    color: Colors.danger,
    marginBottom: 8,
    fontFamily: Fonts.regular,
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.actionMaxWidth,
    marginTop: 18,
    borderRadius: 16,
  },
  buttonContent: {
    minHeight: Layout.controlHeight,
  },
  buttonLabel: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
});
