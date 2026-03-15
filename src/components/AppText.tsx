import { StyleSheet, Text, TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';

export const AppText = ({ style, ...props }: TextProps) => {
  return <Text style={[styles.base, style]} {...props} />;
};

const styles = StyleSheet.create({
  base: {
    fontFamily: Fonts.regular,
  },
});
