import { Question } from '@/hooks/useQuestions';

export type LearningLanguage = 'de' | 'en';

export type LearningAid = {
  topic: Record<LearningLanguage, string>;
  explanation: Record<LearningLanguage, string>;
  source: {
    label: Record<LearningLanguage, string>;
    url: string;
  };
};

const SCRUM_GUIDE_URL = 'https://scrumguides.org/download.html';
const DEVELOPER_PATH_URL = 'https://www.scrum.org/pathway/software-developer-learning-path';

const scrumGuideSource = {
  label: {
    de: 'Scrum Guide auf Deutsch oder Englisch',
    en: 'Scrum Guide in German or English',
  },
  url: SCRUM_GUIDE_URL,
};

const developerPathSource = {
  label: {
    de: 'Software Developer Learning Path',
    en: 'Software Developer Learning Path',
  },
  url: DEVELOPER_PATH_URL,
};

type Rule = {
  matches: RegExp;
  aid: LearningAid;
};

const rules: Rule[] = [
  {
    matches: /product backlog|sprint backlog|increment|definition of done|product goal|sprint goal|artifact/i,
    aid: {
      topic: { de: 'Artefakte & Commitments', en: 'Artifacts & commitments' },
      explanation: {
        de: 'Jedes Scrum-Artefakt macht wichtige Informationen transparent und besitzt ein Commitment: Product Goal, Sprint Goal oder Definition of Done. Ordne die Aussage zuerst dem passenden Artefakt und seinem Zweck zu.',
        en: 'Each Scrum artifact makes important information transparent and has a commitment: the Product Goal, Sprint Goal, or Definition of Done. First connect the statement to the matching artifact and its purpose.',
      },
      source: scrumGuideSource,
    },
  },
  {
    matches: /product owner|scrum master|developers?|development team|scrum team|self-organiz|self-manag|accountab/i,
    aid: {
      topic: { de: 'Scrum Team & Verantwortlichkeiten', en: 'Scrum Team & accountabilities' },
      explanation: {
        de: 'Scrum beschreibt Product Owner, Scrum Master und Developers als klar abgegrenzte Verantwortlichkeiten innerhalb eines gemeinsamen Scrum Teams. Achte auf Ergebnisverantwortung statt auf klassische Hierarchie oder Übergaben.',
        en: 'Scrum defines the Product Owner, Scrum Master, and Developers as distinct accountabilities within one Scrum Team. Look for ownership of outcomes rather than traditional hierarchy or hand-offs.',
      },
      source: scrumGuideSource,
    },
  },
  {
    matches: /sprint planning|daily scrum|sprint review|retrospective|scrum event|time-box|timebox|during the sprint|cancel.*sprint/i,
    aid: {
      topic: { de: 'Scrum Events', en: 'Scrum events' },
      explanation: {
        de: 'Scrum Events schaffen einen festen Rhythmus für Transparenz, Überprüfung und Anpassung. Entscheidend ist jeweils der Zweck des Events – nicht ein vorgeschriebenes Statusritual.',
        en: 'Scrum events create a regular cadence for transparency, inspection, and adaptation. The purpose of each event matters more than a prescribed status ritual.',
      },
      source: scrumGuideSource,
    },
  },
  {
    matches: /transparen|inspect|adapt|empiric|scrum value|commitment|focus|openness|respect|courage|scrum framework/i,
    aid: {
      topic: { de: 'Scrum Grundlagen', en: 'Scrum fundamentals' },
      explanation: {
        de: 'Scrum basiert auf Empirie und Lean Thinking. Prüfe Aussagen danach, ob sie Transparenz erhöhen, häufiges Überprüfen ermöglichen und eine sinnvolle Anpassung unterstützen.',
        en: 'Scrum is founded on empiricism and Lean Thinking. Test statements by whether they increase transparency, enable frequent inspection, and support useful adaptation.',
      },
      source: scrumGuideSource,
    },
  },
  {
    matches: /continuous integration|automated build|build server|checked into version control|integrat(e|ion)|continuous delivery/i,
    aid: {
      topic: { de: 'Continuous Integration', en: 'Continuous integration' },
      explanation: {
        de: 'Continuous Integration integriert Änderungen häufig und prüft sie automatisiert. Ziel ist schnelles Feedback über Integrationsprobleme, damit das Produkt jederzeit in einem nutzbaren Zustand bleiben kann.',
        en: 'Continuous Integration integrates changes frequently and verifies them automatically. Its goal is rapid feedback on integration problems so the product can remain in a usable state.',
      },
      source: developerPathSource,
    },
  },
  {
    matches: /version control|source control|\bmerge\b|\bbranch|check-in|commit code/i,
    aid: {
      topic: { de: 'Versionsverwaltung', en: 'Version control' },
      explanation: {
        de: 'Versionsverwaltung hält Änderungen nachvollziehbar und ermöglicht die Zusammenarbeit an einer gemeinsamen Codebasis. Branches und Merges organisieren Änderungen, ersetzen aber keine frühe und regelmäßige Integration.',
        en: 'Version control keeps changes traceable and enables collaboration on a shared codebase. Branches and merges organize changes, but they do not replace early and frequent integration.',
      },
      source: developerPathSource,
    },
  },
  {
    matches: /test-driven|\btdd\b|behavior-driven|\bbdd\b|acceptance test|unit test|test pyramid|code coverage|regression|test harness|testing|\btest\b/i,
    aid: {
      topic: { de: 'Testing & Qualität', en: 'Testing & quality' },
      explanation: {
        de: 'Tests liefern schnelles Feedback über Verhalten und Risiken, beweisen aber nicht die Abwesenheit aller Fehler. Gute Teststrategien kombinieren passende Testebenen, klare Aussagen und häufige automatisierte Ausführung.',
        en: 'Tests provide rapid feedback about behavior and risk, but they do not prove that all defects are absent. Good test strategies combine suitable test levels, clear assertions, and frequent automated execution.',
      },
      source: developerPathSource,
    },
  },
  {
    matches: /refactor|solid|interface segregation|dependency inversion|single responsibility|coupling|cohesion|architecture|design pattern|technical debt|clean code|legacy code/i,
    aid: {
      topic: { de: 'Design & Architektur', en: 'Design & architecture' },
      explanation: {
        de: 'Professionelles Design hält Code verständlich, testbar und leicht veränderbar. Prinzipien und Refactoring reduzieren unnötige Abhängigkeiten, ohne das von außen beobachtbare Verhalten unbeabsichtigt zu verändern.',
        en: 'Professional design keeps code understandable, testable, and easy to change. Principles and refactoring reduce unnecessary dependencies without unintentionally changing externally observable behavior.',
      },
      source: developerPathSource,
    },
  },
  {
    matches: /devops|deploy|production|release|operations|infrastructure|monitoring/i,
    aid: {
      topic: { de: 'DevOps & Auslieferung', en: 'DevOps & delivery' },
      explanation: {
        de: 'DevOps verkürzt den Feedbackweg von Entwicklung bis Betrieb. Gemeinsame Verantwortung und Automatisierung helfen, kleine Änderungen zuverlässig und wiederholbar auszuliefern.',
        en: 'DevOps shortens the feedback loop from development to operations. Shared ownership and automation help teams deliver small changes reliably and repeatedly.',
      },
      source: developerPathSource,
    },
  },
  {
    matches: /stakeholder|customer|user|value|requirement|forecast|estimate|planning poker|velocity|product/i,
    aid: {
      topic: { de: 'Produkt & Wert', en: 'Product & value' },
      explanation: {
        de: 'Produktentscheidungen sollten Wert, Ziel und neues Feedback miteinander verbinden. Schätzungen und Pläne unterstützen Entscheidungen, sind aber keine Garantie und sollten bei neuen Erkenntnissen angepasst werden.',
        en: 'Product decisions should connect value, goals, and new feedback. Estimates and plans support decisions, but they are not guarantees and should adapt when new evidence appears.',
      },
      source: developerPathSource,
    },
  },
];

const fallbackAid: LearningAid = {
  topic: { de: 'Professionelle Produktentwicklung', en: 'Professional product development' },
  explanation: {
    de: 'Bevorzuge Antworten, die frühes Feedback, eingebaute Qualität und gemeinsame Verantwortung unterstützen. Absolute Aussagen und späte Übergaben sind häufig ein Hinweis darauf, die Option besonders kritisch zu prüfen.',
    en: 'Prefer answers that support early feedback, built-in quality, and shared ownership. Absolute claims and late hand-offs are often a signal to examine an option especially carefully.',
  },
  source: developerPathSource,
};

export const getLearningAid = (question: Question): LearningAid => {
  const questionMatch = rules.find((rule) => rule.matches.test(question.question));
  const optionMatch = rules.find((rule) => rule.matches.test(question.options.join(' ')));
  const matched = questionMatch?.aid ?? optionMatch?.aid ?? fallbackAid;

  return {
    topic: question.topic ?? matched.topic,
    explanation: question.explanation ?? matched.explanation,
    source: question.source
      ? {
          label: { de: question.source.label, en: question.source.label },
          url: question.source.url,
        }
      : matched.source,
  };
};
