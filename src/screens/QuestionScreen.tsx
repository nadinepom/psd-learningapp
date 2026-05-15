import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { ResultCard } from '@/components/ResultCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Fonts } from '@/constants/theme';
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
    total,
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

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text variant="labelSmall" style={styles.counter}>
          {visibleCounter} / {batchSize}
        </Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="titleLarge" style={styles.question}>
          {question.question}
        </Text>

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
              activeOpacity={isDisabled ? 1 : 0.7}
              style={[styles.optionItem, styles[styleName], shouldDim && styles.optionDisabled]}>
              <AppIcon
                name={isSelected
                  ? isCorrect ? 'check-circle' : 'close-circle'
                  : revealed && isCorrect ? 'check-circle' : 'checkbox-blank-outline'}
                size={24}
                color={
                  revealed && isCorrect ? '#2e7d32'
                  : isSelected ? (isCorrect ? '#2e7d32' : '#c62828')
                  : '#666'
                }
              />
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        <Button
          mode="contained"
          onPress={goNext}
          disabled={selected.length < question.correct.length}
          style={styles.button}>
          Continue
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  headerSpacer: {
    width: 40,
  },
  counter: {
    flex: 1,
    textAlign: 'center',
    opacity: 0.6,
  },
  closeButton: {
    margin: 0,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#555',
    lineHeight: 22,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 32,
    gap: 8,
  },
  question: {
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 28,
    fontFamily: Fonts.bold,
  },
  selectHint: {
    fontFamily: Fonts.bold,
    marginBottom: 8,
    opacity: 0.6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  optionDefault: { backgroundColor: '#f5f5f5' },
  optionCorrect: { backgroundColor: '#c8e6c9' },
  optionWrong: { backgroundColor: '#ffcdd2' },
  optionRevealed: { backgroundColor: '#b2e3f6' },
  optionDisabled: { opacity: 0.45 },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  button: { alignSelf: 'center', marginTop: 32 },
});
