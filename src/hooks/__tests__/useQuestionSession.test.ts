import { act, renderHook } from '@testing-library/react-native';

import { Question } from '../useQuestions';
import { useQuestionSession } from '../useQuestionSession';

const makeQuestion = (correct: number[], optionCount = 4): Question => ({
  question: 'Test question?',
  options: Array.from({ length: optionCount }, (_, i) => `Option ${i}`),
  correct,
});

const defaultParams = (overrides?: Partial<Parameters<typeof useQuestionSession>[0]>) => ({
  questions: [makeQuestion([0]), makeQuestion([1]), makeQuestion([2])],
  reviewMode: false,
  batchSize: 2,
  markResults: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('useQuestionSession – toggleOption', () => {
  it('selects an option', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0));
    expect(result.current.selected).toEqual([0]);
  });

  it('deselects an already-selected option', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0));
    act(() => result.current.toggleOption(0));
    expect(result.current.selected).toEqual([]);
  });

  it('does not exceed the number of correct answers', () => {
    // Question has 1 correct answer — should not allow selecting a second option
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0));
    act(() => result.current.toggleOption(1)); // should be ignored
    expect(result.current.selected).toEqual([0]);
  });

  it('allows selecting up to the number of correct answers for multi-select', () => {
    const questions = [makeQuestion([0, 2])];
    const { result } = renderHook(() => useQuestionSession(defaultParams({ questions })));
    act(() => result.current.toggleOption(0));
    act(() => result.current.toggleOption(2));
    expect(result.current.selected).toEqual([0, 2]);
  });
});

describe('useQuestionSession – canToggleOption', () => {
  it('returns true for an unselected option within the selection limit', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    expect(result.current.canToggleOption(1)).toBe(true);
  });

  it('returns false for an option when the limit is reached and the option is not selected', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0));
    expect(result.current.canToggleOption(1)).toBe(false);
  });

  it('returns true for an already-selected option (to allow deselection)', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0));
    expect(result.current.canToggleOption(0)).toBe(true);
  });

  it('returns false for all options once revealed', () => {
    const questions = [makeQuestion([0, 2])];
    const { result } = renderHook(() => useQuestionSession(defaultParams({ questions })));
    act(() => result.current.toggleOption(0)); // partial → goNext reveals
    act(() => result.current.goNext());
    expect(result.current.canToggleOption(0)).toBe(false);
    expect(result.current.canToggleOption(1)).toBe(false);
  });
});

describe('useQuestionSession – goNext / correct answer flow', () => {
  it('advances to the next question after a correct answer', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0)); // correct for Q1
    act(() => result.current.goNext());
    expect(result.current.question?.correct).toEqual([1]); // now on Q2
  });

  it('sets revealed=true when goNext is called with a partial selection on a multi-select question', () => {
    // For multi-select (correct=[0,2]): selecting only [0] (no wrong answer, but incomplete)
    // → goNext triggers reveal instead of advancing
    const questions = [makeQuestion([0, 2])];
    const { result } = renderHook(() => useQuestionSession(defaultParams({ questions })));
    act(() => result.current.toggleOption(0)); // partial correct selection
    act(() => result.current.goNext());
    expect(result.current.revealed).toBe(true);
  });

  it('shows the result screen after completing a full batch', () => {
    const markResults = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useQuestionSession(defaultParams({ markResults })));

    // Answer Q1 correctly
    act(() => result.current.toggleOption(0));
    act(() => result.current.goNext());

    // Answer Q2 correctly → batch of 2 complete → showResult
    act(() => result.current.toggleOption(1));
    act(() => result.current.goNext());

    expect(result.current.showResult).toBe(true);
    expect(markResults).toHaveBeenCalledTimes(1);
  });

  it('calls markResults with correct pass/fail flags', () => {
    const markResults = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useQuestionSession(defaultParams({ markResults })));

    // Answer Q1 correctly
    act(() => result.current.toggleOption(0));
    act(() => result.current.goNext());

    // Answer Q2 incorrectly — selecting a wrong answer and pressing next immediately
    // accumulates it as wrong (no intermediate reveal step for wrong answers)
    act(() => result.current.toggleOption(0)); // wrong for Q2 (correct is [1])
    act(() => result.current.goNext()); // batch complete → markResults called

    const [, results] = markResults.mock.calls[0];
    expect(results[0]).toBe(true);  // Q1 correct
    expect(results[1]).toBe(false); // Q2 incorrect
  });
});

describe('useQuestionSession – auto-reveal timer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('auto-reveals after 1500 ms when all answers are selected but one is wrong', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));

    // correct is [0], select [1] (wrong) — fills the single-answer slot
    act(() => result.current.toggleOption(1));
    expect(result.current.revealed).toBe(false);

    act(() => jest.advanceTimersByTime(1500));
    expect(result.current.revealed).toBe(true);
  });

  it('does NOT auto-reveal when all selected answers are correct', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0)); // correct answer
    act(() => jest.advanceTimersByTime(2000));
    expect(result.current.revealed).toBe(false);
  });
});

describe('useQuestionSession – getOptionStyleName', () => {
  it('returns optionDefault for an unselected, unrevealed option', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    expect(result.current.getOptionStyleName(1)).toBe('optionDefault');
  });

  it('returns optionCorrect for a selected correct answer before reveal', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0)); // option 0 is correct
    expect(result.current.getOptionStyleName(0)).toBe('optionCorrect');
  });

  it('returns optionWrong for a selected wrong answer before reveal', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(1)); // option 1 is wrong
    expect(result.current.getOptionStyleName(1)).toBe('optionWrong');
  });

  it('returns optionRevealed for the correct options after reveal', () => {
    const questions = [makeQuestion([0, 2])];
    const { result } = renderHook(() => useQuestionSession(defaultParams({ questions })));
    act(() => result.current.toggleOption(0)); // partial → goNext reveals
    act(() => result.current.goNext());
    expect(result.current.getOptionStyleName(0)).toBe('optionRevealed');
    expect(result.current.getOptionStyleName(2)).toBe('optionRevealed');
  });
});
