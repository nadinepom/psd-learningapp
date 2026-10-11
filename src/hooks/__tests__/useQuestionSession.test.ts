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

describe('useQuestionSession – goNext / answer flow', () => {
  it('reveals feedback before advancing after a correct answer', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0)); // correct for Q1
    act(() => result.current.goNext());
    expect(result.current.question?.correct).toEqual([0]);
    expect(result.current.revealed).toBe(true);
    expect(result.current.currentAnswerCorrect).toBe(true);

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
    expect(result.current.currentAnswerCorrect).toBe(false);
  });

  it('shows the result screen after completing a full batch', () => {
    const markResults = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useQuestionSession(defaultParams({ markResults })));

    // Answer Q1 correctly
    act(() => result.current.toggleOption(0));
    act(() => result.current.goNext());
    act(() => result.current.goNext());

    // Answer Q2 correctly → batch of 2 complete → showResult
    act(() => result.current.toggleOption(1));
    act(() => result.current.goNext());
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
    act(() => result.current.goNext());

    // Answer Q2 incorrectly, inspect the feedback, then continue.
    act(() => result.current.toggleOption(0)); // wrong for Q2 (correct is [1])
    act(() => result.current.goNext());
    act(() => result.current.goNext()); // batch complete → markResults called

    const [, results] = markResults.mock.calls[0];
    expect(results[0]).toBe(true);  // Q1 correct
    expect(results[1]).toBe(false); // Q2 incorrect
  });
});

describe('useQuestionSession – early exit', () => {
  it('returns completed answers and keeps the current unchecked question pending', () => {
    const questions = [
      { ...makeQuestion([0]), question: 'First question' },
      { ...makeQuestion([1]), question: 'Second question' },
      { ...makeQuestion([2]), question: 'Third question' },
    ];
    const { result } = renderHook(() =>
      useQuestionSession(defaultParams({ questions, batchSize: 3 }))
    );

    act(() => result.current.toggleOption(0));
    act(() => result.current.goNext());
    act(() => result.current.goNext());

    expect(result.current.getExitSnapshot()).toEqual({
      questions: [questions[0]],
      results: [true],
      pendingQuestionText: 'Second question',
    });
  });

  it('includes the current question after its answer has been checked', () => {
    const questions = [{ ...makeQuestion([0]), question: 'Checked question' }];
    const { result } = renderHook(() =>
      useQuestionSession(defaultParams({ questions, batchSize: 2 }))
    );

    act(() => result.current.toggleOption(1));
    act(() => result.current.goNext());

    expect(result.current.getExitSnapshot()).toEqual({
      questions,
      results: [false],
      pendingQuestionText: null,
    });
  });

  it('does not set a pending training question while reviewing mistakes', () => {
    const { result } = renderHook(() =>
      useQuestionSession(defaultParams({ reviewMode: true }))
    );

    expect(result.current.getExitSnapshot()).toEqual({
      questions: [],
      results: [],
      pendingQuestionText: null,
    });
  });
});

describe('useQuestionSession – getOptionStyleName', () => {
  it('returns optionDefault for an unselected, unrevealed option', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    expect(result.current.getOptionStyleName(1)).toBe('optionDefault');
  });

  it('keeps a selected correct answer neutral before reveal', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(0)); // option 0 is correct
    expect(result.current.getOptionStyleName(0)).toBe('optionSelected');
  });

  it('keeps a selected wrong answer neutral before reveal', () => {
    const { result } = renderHook(() => useQuestionSession(defaultParams()));
    act(() => result.current.toggleOption(1)); // option 1 is wrong
    expect(result.current.getOptionStyleName(1)).toBe('optionSelected');
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
