import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton, Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

type Props = {
  correctCount: number;
  total: number;
  incorrectCount: number;
  onContinue: () => void;
};

export const ResultCard = ({ correctCount, total, incorrectCount, onContinue }: Props) => {
  const passed = correctCount > total / 2;

  return (
    <View style={styles.container}>
      <IconButton
        icon="close"
        size={24}
        style={styles.closeButton}
        onPress={() => router.replace('/')}
      />

      <View style={styles.result}>
        <Text style={styles.emoji}>{passed ? '😊' : '😢'}</Text>
        <Text variant="titleLarge" style={styles.message}>
          {passed ? 'Great! Keep it up' : "Don't give up. You've got this."}
        </Text>
        <Text variant="bodyMedium" style={styles.score}>
          {correctCount} / {total} correct
        </Text>
      </View>

      {incorrectCount > 0 && (
        <View style={styles.infoBox}>
          <Text variant="bodyMedium" style={styles.infoText}>
            {incorrectCount} incorrect {incorrectCount === 1 ? 'answer has' : 'answers have'} been saved for review.
          </Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={onContinue}
        style={styles.continueButton}
        contentStyle={styles.continueContent}
        labelStyle={styles.continueLabel}>
        Continue Training
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  result: {
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 72,
  },
  message: {
    textAlign: 'center',
    fontFamily: Fonts.bold,
  },
  score: {
    opacity: 0.6,
    fontFamily: Fonts.regular,
  },
  infoBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontFamily: Fonts.regular,
    color: '#333',
  },
  continueButton: {
    borderRadius: 24,
    alignSelf: 'stretch',
  },
  continueContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  continueLabel: {
    fontSize: 18,
    color: '#fff',
  },
});
