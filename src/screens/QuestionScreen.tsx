import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { LearningAidCard } from '@/components/LearningAidCard';
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
  const scrollRef = useRef<ScrollView>(null);
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
    currentAnswerCorrect,
    showResult,
    batchResults,
    goNext,
    continueAfterResult,
    getExitSnapshot,
    toggleOption,
    canToggleOption,
    getOptionStyleName,
    shouldDimOption,
  } = useQuestionSession({ questions, reviewMode, batchSize, markResults });

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [question]);

  const handleContinueAfterResult = () => {
    const shouldGoHome = continueAfterResult();
    stopReview();
    if (shouldGoHome) {
      router.replace('/');
    }
  };

  const handleClose = async () => {
    const exitSnapshot = getExitSnapshot();

    if (exitSnapshot.questions.length > 0) {
      await markResults(
        exitSnapshot.questions,
        exitSnapshot.results,
        reviewMode,
        exitSnapshot.pendingQuestionText
      );
    } else if (exitSnapshot.pendingQuestionText) {
      await pauseTraining(exitSnapshot.pendingQuestionText);
    }

    stopReview();
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
          {reviewMode ? 'REVIEW' : 'TRAINING'}
        </Text>
        <Text style={styles.counter}>
          Question {visibleCounter} of {batchSize}
        </Text>
        <TouchableOpacity
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Save progress and return home"
          style={styles.closeButton}>
          <AppIcon name="close" size={19} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${sessionProgress}%` }]} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionEyebrow}>YOUR QUESTION</Text>
          <Text variant="titleLarge" style={styles.question}>
            {question.question}
          </Text>
          <Text style={styles.answerHint}>
            {answerCount === 1
              ? 'Select one answer.'
              : `Select ${answerCount} answers.`}
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
                  name={revealed
                    ? isCorrect ? 'check-circle' : isSelected ? 'close-circle' : 'checkbox-blank-outline'
                    : isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-outline'}
                  size={24}
                  color={
                    revealed && isCorrect ? Colors.success
                    : revealed && isSelected ? Colors.danger
                    : isSelected ? Colors.primary
                    : Colors.textMuted
                  }
                />
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {revealed && !currentAnswerCorrect && <LearningAidCard question={question} />}

        <Button
          mode="contained"
          onPress={goNext}
          disabled={selected.length < question.correct.length}
          icon={({ size, color }) => (
            <AppIcon name={revealed ? 'arrow-right' : 'check'} size={size} color={color} />
          )}
          style={styles.button}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}>
          {revealed ? 'Next' : 'Check answer'}
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
  optionSelected: { backgroundColor: Colors.primarySoft, borderColor: '#AFC7F5' },
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
