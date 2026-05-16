import { shuffle } from '../useQuestions';

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    expect(shuffle([1, 2, 3, 4, 5])).toHaveLength(5);
  });

  it('contains the same elements as the input', () => {
    const input = ['a', 'b', 'c', 'd'];
    expect(shuffle(input).sort()).toEqual([...input].sort());
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffle(input);
    expect(input).toEqual(copy);
  });

  it('returns a new array reference', () => {
    const input = [1, 2, 3];
    expect(shuffle(input)).not.toBe(input);
  });

  it('handles an empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});
