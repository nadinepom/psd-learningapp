import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export const PasswordScreen = () => {
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
      <View style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>
          PSD Learning
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Bitte gib das Passwort ein, um fortzufahren.
        </Text>

        <TextInput
          label="Passwort"
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
        />

        {error && (
          <Text variant="bodySmall" style={styles.errorText}>
            Falsches Passwort. Bitte versuche es erneut.
          </Text>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading || password.length === 0}
          style={styles.button}
          contentStyle={styles.buttonContent}>
          Entsperren
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
    backgroundColor: '#E6F4FE',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    marginBottom: 8,
    textAlign: 'center',
    color: '#0250b0',
  },
  subtitle: {
    fontFamily: Fonts.regular,
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: '#c0392b',
    marginBottom: 8,
    fontFamily: Fonts.regular,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 4,
  },
});
