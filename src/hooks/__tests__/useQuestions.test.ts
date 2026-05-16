import { renderHook } from '@testing-library/react-native';

import { useQuestions } from '../useQuestions';

// jest.mock() factory cannot reference out-of-scope variables, so the data is defined inline.
// MOCK_QUESTIONS is defined separately for use in assertions.
jest.mock('@/data/questions.json', () => ({
  questions: Array.from({ length: 15 }, (_, i) => ({
    question: `Q${i + 1}`,
    options: ['Option A', 'Option B', 'Option C'],
    correct: [0],
  })),
}));

const MOCK_QUESTIONS = Array.from({ length: 15 }, (_, i) => ({
  question: `Q${i + 1}`,
  options: ['Option A', 'Option B', 'Option C'],
  correct: [0],
}));

describe('useQuestions', () => {
  it('returns all questions when none are seen', () => {
    const { result } = renderHook(() => useQuestions());
    expect(result.current).toHaveLength(MOCK_QUESTIONS.length);
  });

  it('excludes seen questions when ≥ 10 remain unseen', () => {
    // Mark 4 as seen → 11 unseen, so exclusion should apply
    const seen = ['Q1', 'Q2', 'Q3', 'Q4'];
    const { result } = renderHook(() => useQuestions(seen));
    const returned = result.current;

    expect(returned).toHaveLength(MOCK_QUESTIONS.length - seen.length);
    seen.forEach((q) => {
      expect(returned.find((r) => r.question === q)).toBeUndefined();
    });
  });

  it('falls back to all questions when fewer than 10 are unseen', () => {
    // Mark 7 as seen → 8 unseen < 10, should return all 15
    const seen = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7'];
    const { result } = renderHook(() => useQuestions(seen));
    expect(result.current).toHaveLength(MOCK_QUESTIONS.length);
  });

  it('places the pending question first when provided', () => {
    const { result } = renderHook(() => useQuestions([], 'Q5'));
    expect(result.current[0].question).toBe('Q5');
  });

  it('returns all elements even when a pending question is specified', () => {
    const { result } = renderHook(() => useQuestions([], 'Q3'));
    expect(result.current).toHaveLength(MOCK_QUESTIONS.length);
  });

  it('ignores a pending question that is not found in the pool', () => {
    const { result } = renderHook(() => useQuestions([], 'DOES_NOT_EXIST'));
    expect(result.current).toHaveLength(MOCK_QUESTIONS.length);
  });
});
