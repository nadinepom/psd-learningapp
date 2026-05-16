import { useMemo } from 'react';

import questionsData from '@/data/questions.json';

export const TOTAL_QUESTIONS = (questionsData.questions as { question: string; options: string[]; correct: number[] }[]).length;

export type Question = {
  question: string;
  options: string[];
  correct: number[];
};

export const shuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export const useQuestions = (seenQuestions: string[] = [], pendingQuestionText: string | null = null): Question[] => {
  return useMemo(() => {
    const all = questionsData.questions as Question[];
    const unseen = all.filter((q) => !seenQuestions.includes(q.question));
    const pool = unseen.length >= 10 ? unseen : all;
    const shuffled = shuffle(pool);
    if (!pendingQuestionText) return shuffled;
    const pendingIndex = shuffled.findIndex((q) => q.question === pendingQuestionText);
    if (pendingIndex <= 0) return shuffled;
    const [pending] = shuffled.splice(pendingIndex, 1);
    return [pending, ...shuffled];
  // Computed once on mount — seenQuestions snapshot at session start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
