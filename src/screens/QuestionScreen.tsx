import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { ResultCard } from '@/components/ResultCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Colors, Fonts, Layout } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';
import { shuffle, useQuestions } from '@/hooks/useQuestions';
import { useQuestionSession } from '@/hooks/useQuestionSession';

const BATCH_SIZE = 10;

const shuffleQuestions = (questions: ReturnType<typeof useQuestions>) =>
  shuffle(questions).map((q) => {
    const shuffledIndices = shuffle(q.options.map((_, i) => i));
    return {
      ...q,
      options: shuffledIndices.map((i) => q.options[i]),
      correct: q.correct.map((c) => shuffledIndices.indexOf(c)),
    };
  });

export const QuestionScreen = () => {
  const { seenQuestions, incorrectQuestions, reviewMode, pendingQuestionText, markResults, pauseTraining, stopReview } = useTraining();
  const regularQuestions = useQuestions(seenQuestions, pendingQuestionText);
  const [reviewQuestions, setReviewQuestions] = useState(() =>
    reviewMode ? shuffleQuestions(incorrectQuestions) : []
  );
  useEffect(() => {
    if (reviewMode) {
      setReviewQuestions(shuffleQuestions(incorrectQuestions));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewMode]);
  const questions = reviewMode ? reviewQuestions : regularQuestions;
  const batchSize = reviewMode ? questions.length : BATCH_SIZE;
  const {
    question,
    visibleCounter,
    selected,
    revealed,
    showResult,
    batchQuestions,
    batchResults,
    goNext,
    continueAfterResult,
    openResult,
    toggleOption,
    canToggleOption,
    getOptionStyleName,
    shouldDimOption,
  } = useQuestionSession({ questions, reviewMode, batchSize, markResults });

  const handleContinueAfterResult = () => {
    const shouldGoHome = continueAfterResult();
    stopReview();
    if (shouldGoHome) {
      router.replace('/');
    }
  };

  const handleClose = () => {
    if (reviewMode) {
      if (batchResults.length === 0) {
        stopReview();
        router.replace('/');
        return;
      }
      markResults(batchQuestions, batchResults, true);
      openResult();
      return;
    }
    stopReview();
    pauseTraining(question!.question);
    router.replace('/');
  };

  if (showResult) {
    const correctCount = batchResults.filter(Boolean).length;
    const incorrectCount = batchResults.filter((r) => !r).length;
    return (
      <ScreenContainer>
        <ResultCard
          correctCount={correctCount}
          total={batchResults.length}
          incorrectCount={incorrectCount}
          isReview={reviewMode}
          onContinue={handleContinueAfterResult}
        />
      </ScreenContainer>
    );
  }

  if (!question) return null;

  const sessionProgress = Math.min(100, Math.round((visibleCounter / batchSize) * 100));
  const answerCount = question.correct.length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>
          {reviewMode ? 'WIEDERHOLUNG' : 'TRAINING'}
        </Text>
        <Text style={styles.counter}>
          Frage {visibleCounter} von {batchSize}
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <AppIcon name="close" size={19} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${sessionProgress}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionEyebrow}>DEINE FRAGE</Text>
          <Text variant="titleLarge" style={styles.question}>
            {question.question}
          </Text>
          <Text style={styles.answerHint}>
            {answerCount === 1
              ? 'Wähle eine Antwort aus.'
              : `Wähle ${answerCount} Antworten aus.`}
          </Text>
        </View>

        <View style={styles.optionsList}>
          {question.options.map((option, index) => {
            const isCorrect = question.correct.includes(index);
            const isSelected = selected.includes(index);
            const isDisabled = !canToggleOption(index);
            const styleName = getOptionStyleName(index);
            const shouldDim = shouldDimOption(index);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => canToggleOption(index) && toggleOption(index)}
                disabled={isDisabled}
                activeOpacity={isDisabled ? 1 : 0.72}
                style={[styles.optionItem, styles[styleName], shouldDim && styles.optionDisabled]}>
                <AppIcon
                  name={isSelected
                    ? isCorrect ? 'check-circle' : 'close-circle'
                    : revealed && isCorrect ? 'check-circle' : 'checkbox-blank-outline'}
                  size={24}
                  color={
                    revealed && isCorrect ? Colors.success
                    : isSelected ? (isCorrect ? Colors.success : Colors.danger)
                    : Colors.textMuted
                  }
                />
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          mode="contained"
          onPress={goNext}
          disabled={selected.length < question.correct.length}
          icon={({ size, color }) => <AppIcon name="arrow-right" size={size} color={color} />}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}>
          Weiter
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  sectionLabel: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.3,
  },
  counter: {
    flex: 1,
    textAlign: 'center',
    color: Colors.textMuted,
    fontFamily: Fonts.monoMedium,
    fontSize: 13,
  },
  closeButton: {
    width: Layout.minTouchTarget,
    height: Layout.minTouchTarget,
    borderRadius: Layout.minTouchTarget / 2,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 28,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  questionEyebrow: {
    color: Colors.accent,
    fontFamily: Fonts.monoBold,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  question: {
    color: Colors.text,
    lineHeight: 30,
    fontFamily: Fonts.bold,
    letterSpacing: -0.25,
  },
  answerHint: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 13,
    marginTop: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionDefault: { backgroundColor: Colors.surface, borderColor: Colors.border },
  optionCorrect: { backgroundColor: Colors.successSoft, borderColor: '#B9E2CB' },
  optionWrong: { backgroundColor: Colors.dangerSoft, borderColor: '#F3C4C9' },
  optionRevealed: { backgroundColor: Colors.infoSoft, borderColor: '#B8DDE8' },
  optionDisabled: { opacity: 0.45 },
  optionText: {
    flex: 1,
    color: Colors.text,
    fontSize: 15.5,
    lineHeight: 22,
    fontFamily: Fonts.regular,
  },
  button: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: Layout.actionMaxWidth,
    borderRadius: 16,
    marginTop: 24,
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
