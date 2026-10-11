import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { Colors, Fonts, Layout } from '@/constants/theme';

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
  const resultIcon = allCorrect
    ? 'trophy-outline' as const
    : (passed ? 'check-decagram-outline' as const : 'lightbulb-on-outline' as const);
  const message = allCorrect
    ? 'Perfect — all correct!'
    : (passed ? 'Strong round!' : "Keep going — you've got this.");

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.closeButton}>
          <AppIcon name="close" size={19} color={Colors.textMuted} />
        </TouchableOpacity>

        <View style={styles.result}>
          <View style={styles.resultIconBadge}>
            <AppIcon name={resultIcon} size={48} color={Colors.primary} />
          </View>
          <Text style={styles.eyebrow}>ROUND COMPLETE</Text>
          <Text variant="headlineSmall" style={styles.message}>
            {message}
          </Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreValue}>{correctCount} / {total}</Text>
            <Text style={styles.scoreLabel}>answered correctly</Text>
          </View>
        </View>

        {!isReview && incorrectCount > 0 && (
          <View style={styles.infoBox}>
            <View style={styles.infoDot} />
            <Text variant="bodyMedium" style={styles.infoText}>
              {incorrectCount === 1
                ? 'One answer was saved for review.'
                : `${incorrectCount} answers were saved for review.`}
            </Text>
          </View>
        )}

        <Button
          mode="contained"
          onPress={onContinue}
          icon={({ size, color }) => (
            <AppIcon
              name={isReview ? 'home-outline' : 'arrow-right'}
              size={size}
              color={color}
            />
          )}
          style={styles.continueButton}
          contentStyle={styles.continueContent}
          labelStyle={styles.continueLabel}>
          {isReview ? 'Finish' : 'Continue'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    boxSizing: 'border-box',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 620,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 28,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    borderRadius: Layout.minTouchTarget / 2,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  result: {
    alignItems: 'center',
  },
  resultIconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    marginBottom: 20,
  },
  eyebrow: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: -0.35,
  },
  scorePill: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 20,
  },
  scoreValue: {
    color: Colors.text,
    fontFamily: Fonts.monoBold,
    fontSize: 22,
  },
  scoreLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  infoBox: {
    boxSizing: 'border-box',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.infoSoft,
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  infoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.regular,
    color: Colors.text,
    lineHeight: 20,
  },
  continueButton: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.actionMaxWidth,
    borderRadius: 16,
    marginTop: 24,
  },
  continueContent: {
    minHeight: Layout.controlHeight,
  },
  continueLabel: {
    fontSize: 16,
    color: Colors.white,
    fontFamily: Fonts.medium,
  },
});
