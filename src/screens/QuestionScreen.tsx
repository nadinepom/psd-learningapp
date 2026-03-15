import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Button, Icon, IconButton, Text } from 'react-native-paper';

import { ResultCard } from '@/components/ResultCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Fonts } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';
import { useQuestions } from '@/hooks/useQuestions';

const BATCH_SIZE = 10;

export const QuestionScreen = () => {
  const { seenQuestions, incorrectQuestions, reviewMode, pendingQuestionText, markResults, pauseTraining, stopReview } = useTraining();
  const regularQuestions = useQuestions(seenQuestions, pendingQuestionText);
  const questions = reviewMode ? incorrectQuestions : regularQuestions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [batchQuestions, setBatchQuestions] = useState<typeof questions>([]);
  const [batchResults, setBatchResults] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { width } = useWindowDimensions();
  const isCompact = width < 600;

  const question = questions[currentIndex];
  const total = questions.length;
  const batchSize = reviewMode ? total : BATCH_SIZE;

  const hasWrongAnswer = selected.some((i) => !question?.correct.includes(i));

  useEffect(() => {
    if (!question) return;
    const allExpectedSelected = selected.length === question.correct.length;
    if (allExpectedSelected && hasWrongAnswer && !revealed) {
      revealTimer.current = setTimeout(() => setRevealed(true), 1500);
    }
    return () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [selected]);

  if (!question) return null;

  const isAnswerCorrect = () =>
    selected.length > 0 &&
    selected.every((i) => question.correct.includes(i)) &&
    question.correct.every((i) => selected.includes(i));

  const goNext = () => {
    if (!revealed && !hasWrongAnswer && !isAnswerCorrect() && selected.length > 0) {
      setRevealed(true);
      return;
    }

    const correct = isAnswerCorrect();
    const newQuestions = [...batchQuestions, question];
    const newResults = [...batchResults, correct];

    if (newResults.length === batchSize || currentIndex === total - 1) {
      markResults(newQuestions, newResults);
      setBatchQuestions(newQuestions);
      setBatchResults(newResults);
      setShowResult(true);
    } else {
      setBatchQuestions(newQuestions);
      setBatchResults(newResults);
      setCurrentIndex((i) => i + 1);
      setSelected([]);
      setRevealed(false);
    }
  };

  const handleContinueAfterResult = () => {
    stopReview();
    setShowResult(false);
    setBatchQuestions([]);
    setBatchResults([]);
    setCurrentIndex((i) => Math.min(i + 1, total - 1));
    setSelected([]);
    setRevealed(false);
  };

  const handleClose = () => {
    stopReview();
    pauseTraining(question.question);
    router.replace('/');
  };

  const toggleOption = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
    setRevealed(false);
  };

  const getOptionStyle = (index: number) => {
    if (revealed) {
      if (question.correct.includes(index)) return styles.optionRevealed;
      if (selected.includes(index)) return styles.optionWrong;
      return styles.optionDefault;
    }
    if (!selected.includes(index)) return styles.optionDefault;
    return question.correct.includes(index) ? styles.optionCorrect : styles.optionWrong;
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
          {currentIndex + 1} / {batchSize}
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
          return (
            <TouchableOpacity
              key={index}
              onPress={() => !revealed && toggleOption(index)}
              activeOpacity={revealed ? 1 : 0.7}
              style={[styles.optionItem, getOptionStyle(index)]}>
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
          style={[styles.button, isCompact && styles.buttonFullWidth]}>
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
  optionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.regular,
  },
  button: { alignSelf: 'center', marginTop: 32 },
  buttonFullWidth: { alignSelf: 'stretch' },
});
