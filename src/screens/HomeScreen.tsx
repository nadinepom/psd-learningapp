import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, ProgressBar, Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';

const TOTAL_QUESTIONS = 336;

const B = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ fontFamily: Fonts.bold }}>{children}</Text>
);

export const HomeScreen = () => {
  const { width } = useWindowDimensions();
  const { hasCompletedFirstTraining, totalAnswered, totalCorrect, incorrectQuestions, startReview, resetProgress } = useTraining();
  const [dialogVisible, setDialogVisible] = useState(false);

  const progress = totalAnswered / TOTAL_QUESTIONS;
  const progressPercent = Math.round(progress * 100);

  const handleStart = () => {
    if (hasCompletedFirstTraining) {
      setDialogVisible(true);
    } else {
      router.push('/question');
    }
  };

  return (
    <View style={styles.outer}>
      <Stack.Screen options={{ headerShown: false }} />

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={styles.dialog}>

          <View style={styles.dialogHeader}>
            <IconButton
              icon="close"
              size={20}
              onPress={() => setDialogVisible(false)}
            />
          </View>

          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogLine}>
              You've answered <B>{totalAnswered}</B> of <B>{TOTAL_QUESTIONS}</B> questions so far.
            </Text>
            <Text style={[styles.dialogLine, styles.dialogLineSpacing]}>
              <B>{totalCorrect}</B> were correct. Keep it up! 👍
            </Text>
          </Dialog.Content>

          <Dialog.Actions style={styles.dialogActions}>
            <Button
              disabled={incorrectQuestions.length === 0}
              onPress={() => {
                setDialogVisible(false);
                startReview();
                router.push('/question');
              }}>
              Review mistakes
            </Button>
            <Button
              mode="contained"
              style={styles.letsGoButton}
              onPress={() => {
                setDialogVisible(false);
                router.push('/question');
              }}>
              Let's go!
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <View style={styles.content}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: Math.min(480, width - 48), height: Math.min(480, width - 48) }}
          resizeMode="contain"
        />

        <View style={[styles.buttonContainer, { width: Math.min(480, width - 48) }]}>
          <Button
            mode="contained"
            onPress={handleStart}
            style={styles.button}
            labelStyle={styles.label}
            contentStyle={styles.buttonContent}>
            Start your Training
          </Button>

          {hasCompletedFirstTraining && (
            <View style={styles.progressContainer}>
              <ProgressBar progress={progress} style={styles.progressBar} />
              <Text style={styles.progressLabel}>{progressPercent}% von 100%</Text>
              <Button
                mode="text"
                compact
                textColor="#666"
                onPress={resetProgress}
                style={styles.resetButton}>
                Fortschritt zurücksetzen
              </Button>
            </View>
          )}

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#b2e3f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  progressContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 24,
    marginTop: 12,
    gap: 4,
    alignItems: 'center',
  },
  resetButton: {
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },
  button: {
    borderRadius: 24,
    alignSelf: 'stretch',
  },
  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 18,
    color: '#fff',
    fontFamily: Fonts.medium,
  },
  dialog: {
    alignSelf: 'center',
    width: 380,
  },
  dialogHeader: {
    alignItems: 'flex-end',
    paddingTop: 4,
    paddingRight: 4,
  },
  dialogContent: {
    alignItems: 'center',
    paddingTop: 0,
    paddingHorizontal: 24,
  },
  dialogLine: {
    fontFamily: Fonts.regular,
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
  },
  dialogLineSpacing: {
    marginTop: 6,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  letsGoButton: {
    borderRadius: 24,
    paddingHorizontal: 8,
  },
});
