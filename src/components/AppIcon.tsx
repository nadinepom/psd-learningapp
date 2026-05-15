import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle, Line, Path } from 'react-native-svg';

type IconName = 'check-circle' | 'close-circle' | 'checkbox-blank-outline' | 'eye' | 'eye-off';

type Props = {
  name: IconName;
  size: number;
  color: string;
};

const EyeIcon = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
  </Svg>
);

const EyeOffIcon = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="3" y1="3" x2="21" y2="21" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M10.58 10.58A3 3 0 0 0 14.41 14.41M6.35 6.35A10 10 0 0 0 1 12C1 12 5 20 12 20C14.05 20 15.96 19.39 17.58 18.35M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12C22.43 12.96 21.73 13.87 20.92 14.7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AppIcon = ({ name, size, color }: Props) => {
  if (Platform.OS !== 'web') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  if (name === 'eye') return <EyeIcon size={size} color={color} />;
  if (name === 'eye-off') return <EyeOffIcon size={size} color={color} />;

  const radius = size / 2;

  if (name === 'check-circle' || name === 'close-circle') {
    const char = name === 'check-circle' ? '✓' : '✕';
    return (
      <View style={[styles.circle, {
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: color,
      }]}>
        <Text style={{ color: '#fff', fontSize: size * 0.55, lineHeight: size * 0.62, fontWeight: '700' }}>
          {char}
        </Text>
      </View>
    );
  }

  // checkbox-blank-outline
  return (
    <View style={[styles.circle, {
      width: size,
      height: size,
      borderRadius: radius,
      borderWidth: 2,
      borderColor: color,
    }]} />
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
