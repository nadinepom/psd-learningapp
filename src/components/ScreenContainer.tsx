import { useWindowDimensions, StyleSheet, View, ViewProps } from 'react-native';

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
  },
  compact: {
    marginHorizontal: 24,
    marginTop: 48,
    marginBottom: 68,
  },
  regular: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 800,
    marginTop: 64,
    marginBottom: 80,
    paddingHorizontal: 48,
  },
});
