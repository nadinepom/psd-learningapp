import { useWindowDimensions, StyleSheet, View, ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';

const COMPACT_BREAKPOINT = 600;

export const ScreenContainer = ({ style, ...props }: ViewProps) => {
  const { width } = useWindowDimensions();
  const isCompact = width < COMPACT_BREAKPOINT;

  return (
    <View
      style={[
        styles.base,
        isCompact ? styles.compact : styles.regular,
        style,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  compact: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  regular: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    paddingTop: 40,
    paddingBottom: 56,
    paddingHorizontal: 48,
  },
});
