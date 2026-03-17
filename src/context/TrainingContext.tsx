import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { Question } from '@/hooks/useQuestions';

const STORAGE_KEY = 'psd_training_data';

type TrainingData = {
  seenQuestions: string[];
  totalAnswered: number;
  totalCorrect: number;
  incorrectQuestions: Question[];
  hasCompletedFirstTraining: boolean;
  pendingQuestionText: string | null;
};

const defaultData: TrainingData = {
  seenQuestions: [],
  totalAnswered: 0,
  totalCorrect: 0,
  incorrectQuestions: [],
  hasCompletedFirstTraining: false,
  pendingQuestionText: null,
};

type TrainingContextValue = TrainingData & {
  isLoaded: boolean;
  reviewMode: boolean;
  markResults: (questions: Question[], results: boolean[], isReview?: boolean) => Promise<void>;
  saveIncorrect: (questions: Question[]) => Promise<void>;
  pauseTraining: (questionText: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  startReview: () => void;
  stopReview: () => void;
};

const TrainingContext = createContext<TrainingContextValue | null>(null);

export const TrainingProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<TrainingData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setData(JSON.parse(raw));
      setIsLoaded(true);
    });
  }, []);

  const persist = async (newData: TrainingData) => {
    setData(newData);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const markResults = async (questions: Question[], results: boolean[], isReview?: boolean) => {
    if (isReview) {
      // In review mode, remove questions answered correctly and keep only still-incorrect ones.
      const incorrectByQuestion = new Map(
        data.incorrectQuestions.map((q) => [q.question, q] as const)
      );
      const reviewCorrectCount = results.filter(Boolean).length;

      questions.forEach((q, i) => {
        if (results[i]) {
          incorrectByQuestion.delete(q.question);
        } else {
          incorrectByQuestion.set(q.question, q);
        }
      });

      await persist({
        ...data,
        totalCorrect: data.totalCorrect + reviewCorrectCount,
        incorrectQuestions: Array.from(incorrectByQuestion.values()),
        pendingQuestionText: null,
      });
      return;
    }

    const newIncorrect = questions.filter((_, i) => !results[i]);
    const existing = data.incorrectQuestions.map((q) => q.question);
    const deduped = newIncorrect.filter((q) => !existing.includes(q.question));

    await persist({
      ...data,
      seenQuestions: [...data.seenQuestions, ...questions.map((q) => q.question)],
      totalAnswered: data.totalAnswered + questions.length,
      totalCorrect: data.totalCorrect + results.filter(Boolean).length,
      incorrectQuestions: [...data.incorrectQuestions, ...deduped],
      hasCompletedFirstTraining: true,
      pendingQuestionText: null,
    });
  };

  const pauseTraining = async (questionText: string) => {
    await persist({ ...data, pendingQuestionText: questionText });
  };

  const resetProgress = async () => {
    await persist(defaultData);
    setReviewMode(false);
  };

  const saveIncorrect = async (questions: Question[]) => {
    const existing = data.incorrectQuestions.map((q) => q.question);
    const newIncorrect = questions.filter((q) => !existing.includes(q.question));
    await persist({ ...data, incorrectQuestions: [...data.incorrectQuestions, ...newIncorrect] });
  };

  const startReview = () => setReviewMode(true);
  const stopReview = () => setReviewMode(false);

  return (
    <TrainingContext.Provider value={{ ...data, isLoaded, reviewMode, markResults, saveIncorrect, pauseTraining, resetProgress, startReview, stopReview }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used within TrainingProvider');
  return ctx;
};
