import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';

import { Fonts } from '@/constants/theme';
import { useTraining } from '@/context/TrainingContext';
import { TOTAL_QUESTIONS } from '@/hooks/useQuestions';

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
            <TouchableOpacity onPress={() => setDialogVisible(false)} style={styles.dialogCloseButton}>
              <Text style={styles.dialogCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Dialog.Content style={styles.dialogContent}>
            <Text style={styles.dialogLine}>
              You've answered <B>{totalAnswered}</B> of <B>{TOTAL_QUESTIONS}</B> questions so far.
            </Text>
            {totalCorrect > 0 && (
              <Text style={[styles.dialogLine, styles.dialogLineSpacing]}>
                Keep it up — you've already got <B>{totalCorrect}</B> correct {totalCorrect === 1 ? 'answer' : 'answers'}! 👍 
              </Text>
            )}
          </Dialog.Content>

          <Dialog.Actions
            style={[
              styles.dialogActions,
              incorrectQuestions.length === 0 && styles.dialogActionsCentered,
            ]}>
            {incorrectQuestions.length > 0 && (
            <Button
              onPress={() => {
                setDialogVisible(false);
                startReview();
                router.push('/question');
              }}>
              Review mistakes
            </Button>
            )}
            <Button
              mode="contained"
              style={styles.letsGoButton}
              contentStyle={styles.letsGoButtonContent}
              labelStyle={styles.letsGoButtonLabel}
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
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressLabel}>{progressPercent}% von 100%</Text>
              <Button
                mode="text"
                compact
                textColor="#666"
                onPress={resetProgress}
                style={styles.resetButton}>
                Reset progress
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
    gap: 5,
    alignItems: 'center',
  },
  resetButton: {
    marginTop: 4,
  },
  progressTrack: {
    alignSelf: 'stretch',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d8ebf5',
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0b5394',
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
    width: 340,
    paddingTop: 12,
    paddingBottom: 12,
  },
  dialogHeader: {
    alignItems: 'flex-end',
    paddingTop: 0,
    paddingRight: 4,
  },
  dialogCloseButton: {
    marginTop: -4,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCloseText: {
    fontSize: 20,
    color: '#555',
    lineHeight: 22,
  },
  dialogContent: {
    alignItems: 'center',
    paddingTop: 4,
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  dialogActionsCentered: {
    justifyContent: 'center',
  },
  letsGoButton: {
    borderRadius: 24,
    minWidth: 150,
  },
  letsGoButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 14,
  },
  letsGoButtonLabel: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
});
