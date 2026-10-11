import { router, Stack } from 'expo-router';
import { Image, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { AppIcon } from '@/components/AppIcon';
import { Colors, Fonts, Layout } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';
import { TOTAL_QUESTIONS } from '@/hooks/useQuestions';

export const HomeScreen = () => {
  const { width } = useWindowDimensions();
  const {
    hasCompletedFirstTraining,
    totalAnswered,
    totalCorrect,
    incorrectQuestions,
    startReview,
    stopReview,
    resetProgress,
  } = useTraining();

  const progressPercent = Math.min(100, Math.round((totalAnswered / TOTAL_QUESTIONS) * 100));
  const accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const contentWidth = Math.min(520, width - 40);
  const logoSize = Math.min(164, width - 112);

  const startTraining = () => {
    stopReview();
    router.push('/question');
  };

  const reviewMistakes = () => {
    startReview();
    router.push('/question');
  };

  return (
    <ScrollView
      style={styles.outer}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={[styles.content, { width: contentWidth }]}>
        <View style={[styles.logoFrame, { width: logoSize, height: logoSize }]}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.eyebrow}>PSD LEARNING</Text>
        <Text variant="headlineMedium" style={styles.title}>
          Lerne fokussiert.{`\n`}Bestehe sicher.
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Kurze Trainingseinheiten, klare Rückmeldungen und gezielte Wiederholungen.
        </Text>

        {hasCompletedFirstTraining ? (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.cardEyebrow}>DEIN FORTSCHRITT</Text>
                <Text style={styles.cardTitle}>{totalAnswered} Fragen beantwortet</Text>
              </View>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{accuracyPercent}%</Text>
                <Text style={styles.statLabel}>Trefferquote</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{incorrectQuestions.length}</Text>
                <Text style={styles.statLabel}>Zu wiederholen</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <View style={styles.infoDot} />
            <Text style={styles.infoText}>
              10 Fragen pro Runde · Fortschritt wird automatisch gespeichert
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={startTraining}
            icon={({ size, color }) => <AppIcon name="play" size={size} color={color} />}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryLabel}>
            {hasCompletedFirstTraining ? 'Training fortsetzen' : 'Training starten'}
          </Button>

          {incorrectQuestions.length > 0 && (
            <Button
              mode="outlined"
              onPress={reviewMistakes}
              icon={({ size, color }) => <AppIcon name="history" size={size} color={color} />}
              style={styles.secondaryButton}
              contentStyle={styles.secondaryButtonContent}
              labelStyle={styles.secondaryLabel}>
              Fehler wiederholen
            </Button>
          )}

          {hasCompletedFirstTraining && (
            <Button
              mode="text"
              compact
              textColor={Colors.textMuted}
              onPress={resetProgress}
              icon={({ size, color }) => <AppIcon name="restart" size={size} color={color} />}
              style={styles.resetButton}
              labelStyle={styles.resetLabel}>
              Fortschritt zurücksetzen
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  content: { alignItems: 'center' },
  logoFrame: {
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: 28,
  },
  logo: { width: '100%', height: '100%' },
  eyebrow: {
    color: Colors.primary,
    fontFamily: Fonts.monoBold,
    fontSize: 12,
    letterSpacing: 1.8,
    marginBottom: 10,
  },
  title: {
    color: Colors.text,
    fontFamily: Fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    textAlign: 'center',
    letterSpacing: -0.7,
  },
  subtitle: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 430,
    marginTop: 14,
    marginBottom: 30,
  },
  progressCard: {
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    marginBottom: 22,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardEyebrow: {
    color: Colors.textMuted,
    fontFamily: Fonts.monoMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  cardTitle: { color: Colors.text, fontFamily: Fonts.medium, fontSize: 16 },
  progressPercent: { color: Colors.primary, fontFamily: Fonts.monoBold, fontSize: 24 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceMuted,
    overflow: 'hidden',
    marginTop: 18,
  },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: Colors.text, fontFamily: Fonts.monoBold, fontSize: 20 },
  statLabel: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  infoCard: {
    boxSizing: 'border-box',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
  },
  infoDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.accent },
  infoText: {
    flex: 1,
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    maxWidth: Layout.actionMaxWidth,
    gap: 10,
  },
  primaryButton: { borderRadius: 16 },
  buttonContent: { minHeight: Layout.controlHeight },
  primaryLabel: {
    color: Colors.white,
    fontFamily: Fonts.medium,
    fontSize: 17,
  },
  secondaryButton: {
    borderRadius: 16,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  secondaryButtonContent: { minHeight: Layout.controlHeight },
  secondaryLabel: {
    color: Colors.primaryDark,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  resetButton: { alignSelf: 'center', marginTop: 4 },
  resetLabel: { fontFamily: Fonts.regular, fontSize: 13 },
});
