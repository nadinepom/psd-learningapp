import { router } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Icon, IconButton, Text } from 'react-native-paper';

import { ResultCard } from '@/components/ResultCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Fonts } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';
import { useQuestions } from '@/hooks/useQuestions';
import { useQuestionSession } from '@/hooks/useQuestionSession';

const BATCH_SIZE = 10;

export const QuestionScreen = () => {
  const { seenQuestions, incorrectQuestions, reviewMode, pendingQuestionText, markResults, pauseTraining, stopReview } = useTraining();
  const regularQuestions = useQuestions(seenQuestions, pendingQuestionText);
  const questions = reviewMode ? incorrectQuestions : regularQuestions;
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

  if (!question) return null;

  const handleContinueAfterResult = () => {
    const shouldGoHome = continueAfterResult();
    stopReview();
    if (shouldGoHome) {
      router.replace('/');
    }
  };

  const handleClose = () => {
    if (reviewMode) {
      markResults(batchQuestions, batchResults, true);
      openResult();
      return;
    }
    stopReview();
    pauseTraining(question.question);
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

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text variant="labelSmall" style={styles.counter}>
          {visibleCounter} / {batchSize}
        </Text>
        <IconButton icon="close" size={20} onPress={handleClose} style={styles.closeButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text variant="titleLarge" style={styles.question}>
          {question.question}
        </Text>

        <Text variant="labelSmall" style={styles.selectHint}>
          Select {question.correct.length} {question.correct.length === 1 ? 'answer' : 'answers'}
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
              <Icon
                source={isSelected
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
          disabled={selected.length === 0}
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
