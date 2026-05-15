import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';

type Props = {
  correctCount: number;
  total: number;
  incorrectCount: number;
  onContinue: () => void;
  isReview?: boolean;
};

export const ResultCard = ({ correctCount, total, incorrectCount, onContinue, isReview }: Props) => {
  const allCorrect = total > 0 && correctCount === total;
  const passed = correctCount >= total / 2;
  const emoji = allCorrect ? '🎉' : (passed ? '😊' : '😢');
  const message = allCorrect
    ? 'Perfect! All correct!'
    : (passed ? 'Great! Keep it up' : "Don't give up. You've got this.");

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.result}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text variant="titleLarge" style={styles.message}>
          {message}
        </Text>
        <Text variant="bodyMedium" style={styles.score}>
          {correctCount} / {total} correct
        </Text>
      </View>

      {!isReview && incorrectCount > 0 && (
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
        {isReview ? 'Close the Training' : 'Continue Training'}
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
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#555',
    lineHeight: 24,
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
    alignSelf: 'center',
    maxWidth: 420,
    width: '90%',
  },
  infoText: {
    fontFamily: Fonts.regular,
    color: '#333',
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: 24,
    alignSelf: 'center',
    paddingHorizontal: 16,
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
