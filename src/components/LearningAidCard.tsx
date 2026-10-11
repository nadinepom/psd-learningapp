import { useMemo, useState } from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { Colors, Fonts, Layout } from '@/constants/theme';
import { Question } from '@/hooks/useQuestions';
import { getLearningAid, LearningLanguage } from '@/lib/learningAid';

type Props = {
  question: Question;
};

const copy = {
  de: {
    eyebrow: 'LERNHILFE',
    answer: 'Richtige Antwort',
    answers: 'Richtige Antworten',
    explanation: 'Merksatz',
    source: 'Offiziell vertiefen',
  },
  en: {
    eyebrow: 'LEARNING AID',
    answer: 'Correct answer',
    answers: 'Correct answers',
    explanation: 'Key takeaway',
    source: 'Explore the official source',
  },
};

export const LearningAidCard = ({ question }: Props) => {
  const [language, setLanguage] = useState<LearningLanguage>('en');
  const aid = useMemo(() => getLearningAid(question), [question]);
  const correctAnswers = question.correct.map((index) => question.options[index]);
  const labels = copy[language];

  const openSource = () => {
    void Linking.openURL(aid.source.url).catch(() => undefined);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <View style={styles.iconBadge}>
            <AppIcon name="lightbulb-on-outline" size={18} color={Colors.primary} />
          </View>
          <View style={styles.titleCopy}>
            <Text style={styles.eyebrow}>{labels.eyebrow}</Text>
            <Text style={styles.topic}>{aid.topic[language]}</Text>
          </View>
        </View>

        <View style={styles.languageSwitch} accessibilityRole="tablist">
          {(['en', 'de'] as const).map((item) => {
            const active = item === language;
            return (
              <TouchableOpacity
                key={item}
                onPress={() => setLanguage(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item === 'de' ? 'German' : 'English'}
                style={[styles.languageButton, active && styles.languageButtonActive]}>
                <Text style={[styles.languageLabel, active && styles.languageLabelActive]}>
                  {item.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>
          {correctAnswers.length === 1 ? labels.answer : labels.answers}
        </Text>
        <View style={styles.answerList}>
          {correctAnswers.map((answer) => (
            <View key={answer} style={styles.answerRow}>
              <AppIcon name="check-circle" size={19} color={Colors.success} />
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.explanationSection]}>
        <Text style={styles.sectionLabel}>{labels.explanation}</Text>
        <Text style={styles.explanation}>{aid.explanation[language]}</Text>
      </View>

      <TouchableOpacity
        onPress={openSource}
        accessibilityRole="link"
        accessibilityLabel={`${labels.source}: ${aid.source.label[language]}`}
        style={styles.sourceLink}>
        <AppIcon name="book-open-page-variant-outline" size={18} color={Colors.primary} />
        <View style={styles.sourceCopy}>
          <Text style={styles.sourceEyebrow}>{labels.source}</Text>
          <Text style={styles.sourceLabel}>{aid.source.label[language]}</Text>
        </View>
        <AppIcon name="open-in-new" size={16} color={Colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#CAD9F5',
    backgroundColor: '#F7FAFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  titleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 10,
    letterSpacing: 1.1,
  },
  topic: {
    marginTop: 2,
    color: Colors.text,
    fontFamily: Fonts.semibold,
    fontSize: 14,
    lineHeight: 19,
  },
  languageSwitch: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 10,
    backgroundColor: Colors.surfaceMuted,
  },
  languageButton: {
    minWidth: Layout.minTouchTarget,
    minHeight: 34,
    paddingHorizontal: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButtonActive: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  languageLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.monoBold,
    fontSize: 11,
  },
  languageLabelActive: {
    color: Colors.primary,
  },
  section: {
    marginTop: 18,
  },
  explanationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionLabel: {
    marginBottom: 9,
    color: Colors.textMuted,
    fontFamily: Fonts.semibold,
    fontSize: 12,
  },
  answerList: {
    gap: 8,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  answerText: {
    flex: 1,
    color: Colors.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  explanation: {
    color: Colors.text,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  sourceLink: {
    minHeight: Layout.minTouchTarget,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sourceCopy: {
    flex: 1,
  },
  sourceEyebrow: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 11,
  },
  sourceLabel: {
    marginTop: 1,
    color: Colors.primary,
    fontFamily: Fonts.medium,
    fontSize: 12.5,
    lineHeight: 17,
  },
});
