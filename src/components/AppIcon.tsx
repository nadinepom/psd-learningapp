import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

type IconName = 'check-circle' | 'close-circle' | 'checkbox-blank-outline' | 'eye' | 'eye-off';

type Props = {
  name: IconName;
  size: number;
  color: string;
};

// Auf Web: kein Font-Rendering – stattdessen gestylte Views mit Unicode
const WEB_ICONS: Record<IconName, { char: string; filled: boolean }> = {
  'check-circle':         { char: '✓', filled: true },
  'close-circle':         { char: '✕', filled: true },
  'checkbox-blank-outline': { char: '',  filled: false },
  'eye':                  { char: '●', filled: false },
  'eye-off':              { char: '○', filled: false },
};

export const AppIcon = ({ name, size, color }: Props) => {
  if (Platform.OS !== 'web') {
    return <MaterialCommunityIcons name={name} size={size} color={color} />;
  }

  const icon = WEB_ICONS[name];
  const radius = size / 2;

  if (icon.filled) {
    return (
      <View style={[styles.circle, {
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: color,
      }]}>
        <Text style={{ color: '#fff', fontSize: size * 0.55, lineHeight: size * 0.62, fontWeight: '700' }}>
          {icon.char}
        </Text>
      </View>
    );
  }

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
