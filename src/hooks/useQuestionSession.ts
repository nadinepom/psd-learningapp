import { useState } from 'react';

import { Question } from '@/hooks/useQuestions';

type MarkResults = (
  questions: Question[],
  results: boolean[],
  isReview?: boolean,
  pendingQuestionText?: string | null
) => Promise<void>;

type Params = {
  questions: Question[];
  reviewMode: boolean;
  batchSize: number;
  markResults: MarkResults;
};

export const useQuestionSession = ({ questions, reviewMode, batchSize, markResults }: Params) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [batchStartIndex, setBatchStartIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [batchQuestions, setBatchQuestions] = useState<Question[]>([]);
  const [batchResults, setBatchResults] = useState<boolean[]>([]);
  const [showResult, setShowResult] = useState(false);

  const question = questions[currentIndex];
  const total = questions.length;
  const visibleCounter = currentIndex - batchStartIndex + 1;

  const isAnswerCorrect = () => {
    if (!question) return false;

    return (
      selected.length > 0 &&
      selected.every((i) => question.correct.includes(i)) &&
      question.correct.every((i) => selected.includes(i))
    );
  };

  const goNext = () => {
    if (!question) return;

    if (!revealed && selected.length > 0) {
      setRevealed(true);
      return;
    }

    const correct = isAnswerCorrect();
    const newQuestions = [...batchQuestions, question];
    const newResults = [...batchResults, correct];

    if (newResults.length === batchSize || currentIndex === total - 1) {
      markResults(newQuestions, newResults, reviewMode);
      setBatchQuestions(newQuestions);
      setBatchResults(newResults);
      setShowResult(true);
      return;
    }

    setBatchQuestions(newQuestions);
    setBatchResults(newResults);
    setCurrentIndex((i) => i + 1);
    setSelected([]);
    setRevealed(false);
  };

  const continueAfterResult = () => {
    if (reviewMode) {
      return true;
    }

    const nextIndex = Math.min(currentIndex + 1, total - 1);
    setShowResult(false);
    setBatchQuestions([]);
    setBatchResults([]);
    setCurrentIndex(nextIndex);
    setBatchStartIndex(nextIndex);
    setSelected([]);
    setRevealed(false);

    return false;
  };

  const getExitSnapshot = () => {
    if (revealed && question) {
      return {
        questions: [...batchQuestions, question],
        results: [...batchResults, isAnswerCorrect()],
        pendingQuestionText: null,
      };
    }

    return {
      questions: [...batchQuestions],
      results: [...batchResults],
      pendingQuestionText: !reviewMode ? question?.question ?? null : null,
    };
  };

  const toggleOption = (index: number) => {
    if (!question) return;

    const maxSelectable = question.correct.length;
    setSelected((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }

      if (prev.length >= maxSelectable) {
        return prev;
      }

      return [...prev, index];
    });
    setRevealed(false);
  };

  const canToggleOption = (index: number) => {
    if (!question) return false;
    if (revealed) return false;
    if (selected.includes(index)) return true;
    return selected.length < question.correct.length;
  };

  const getOptionStyleName = (index: number) => {
    if (!question) return 'optionDefault' as const;

    if (revealed) {
      if (question.correct.includes(index)) return 'optionRevealed' as const;
      if (selected.includes(index)) return 'optionWrong' as const;
      return 'optionDefault' as const;
    }

    if (!selected.includes(index)) return 'optionDefault' as const;
    return 'optionSelected' as const;
  };

  const shouldDimOption = (index: number) => {
    if (!question) return false;

    const isDisabled = !canToggleOption(index);
    const isCorrect = question.correct.includes(index);
    return isDisabled && !(revealed && isCorrect);
  };

  const currentAnswerCorrect = isAnswerCorrect();

  return {
    question,
    total,
    visibleCounter,
    selected,
    revealed,
    currentAnswerCorrect,
    showResult,
    batchQuestions,
    batchResults,
    goNext,
    continueAfterResult,
    getExitSnapshot,
    toggleOption,
    canToggleOption,
    getOptionStyleName,
    shouldDimOption,
  };
};
