import { Question } from '@/hooks/useQuestions';
import { getLearningAid } from '@/lib/learningAid';

const makeQuestion = (question: string, options: string[] = ['Yes', 'No']): Question => ({
  question,
  options,
  correct: [0],
});

describe('getLearningAid', () => {
  it('assigns Scrum artifact guidance from the question content', () => {
    const aid = getLearningAid(makeQuestion('Who owns the Sprint Backlog?'));

    expect(aid.topic.de).toBe('Artefakte & Commitments');
    expect(aid.source.url).toContain('scrumguides.org');
  });

  it('assigns testing guidance from answer content', () => {
    const aid = getLearningAid(
      makeQuestion('Which practice gives fast feedback?', ['Automated unit tests', 'A late hand-off'])
    );

    expect(aid.topic.en).toBe('Testing & quality');
  });

  it('prefers a curated bilingual explanation when a question provides one', () => {
    const question: Question = {
      ...makeQuestion('A custom question'),
      topic: { de: 'Eigenes Thema', en: 'Custom topic' },
      explanation: { de: 'Deutsche Erklärung', en: 'English explanation' },
      source: { label: 'Primary source', url: 'https://example.com/source' },
    };

    const aid = getLearningAid(question);

    expect(aid.topic).toEqual(question.topic);
    expect(aid.explanation).toEqual(question.explanation);
    expect(aid.source.url).toBe(question.source?.url);
  });
});
