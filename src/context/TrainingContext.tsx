import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { Question } from '@/hooks/useQuestions';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

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
  /** Firebase Anonymous User-ID – zeige sie dem Nutzer als Sicherungscode */
  cloudUserId: string | null;
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
  const [cloudUserId, setCloudUserId] = useState<string | null>(null);

  useEffect(() => {
    const useCloud = isFirebaseConfigured && Platform.OS === 'web' && db && auth;

    if (!useCloud) {
      // Native oder Firebase nicht konfiguriert: nur AsyncStorage verwenden
      AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
        if (raw) {
          try { setData(JSON.parse(raw)); } catch { /* Daten korrupt – frisch starten */ }
        }
        setIsLoaded(true);
      });
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    (async () => {
      try {
        const userCredential = await signInAnonymously(auth!);
        if (cancelled) return;
        const uid = userCredential.user.uid;
        setCloudUserId(uid);

        const docRef = doc(db!, 'progress', uid);

        unsubscribe = onSnapshot(docRef, async (snap) => {
          if (cancelled) return;
          if (snap.exists()) {
            // Firestore-Daten laden (Cloud-Stand)
            setData(snap.data() as TrainingData);
          } else {
            // Neuer Nutzer: prüfe ob lokale Daten vorhanden sind und migriere sie
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
              try {
                const localData: TrainingData = JSON.parse(raw);
                if (cancelled) return;
                await setDoc(docRef, localData);
                if (cancelled) return;
                setData(localData);
              } catch { /* Daten korrupt – frisch starten */ }
            }
          }
          if (!cancelled) setIsLoaded(true);
        });
      } catch {
        if (cancelled) return;
        // Firebase-Fehler: Fallback auf AsyncStorage
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          try { setData(JSON.parse(raw)); } catch { /* Daten korrupt – frisch starten */ }
        }
        setIsLoaded(true);
      }
    })();

    return () => { cancelled = true; unsubscribe?.(); };
  }, []);

  const persist = async (newData: TrainingData) => {
    setData(newData);
    // Immer lokal speichern (offline-fähig)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newData));

    // Zusätzlich in Firestore speichern (Cloud-Backup, nur Web)
    if (isFirebaseConfigured && Platform.OS === 'web' && db && cloudUserId) {
      const docRef = doc(db, 'progress', cloudUserId);
      await setDoc(docRef, newData).catch(() => {
        // Netzwerkfehler still ignorieren – AsyncStorage ist Fallback
      });
    }
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
    <TrainingContext.Provider value={{ ...data, isLoaded, reviewMode, cloudUserId, markResults, saveIncorrect, pauseTraining, resetProgress, startReview, stopReview }}>
      {children}
    </TrainingContext.Provider>
  );
};

export const useTraining = () => {
  const ctx = useContext(TrainingContext);
  if (!ctx) throw new Error('useTraining must be used within TrainingProvider');
  return ctx;
};
