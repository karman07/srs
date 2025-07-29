import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useThemeContext } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useThemeContext();

  return (
    <View style={styles.container}>
      <IconButton
        icon={isDark ? 'white-balance-sunny' : 'weather-night'}
        iconColor={colors.primary}
        size={28}
        onPress={toggleTheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    borderRadius: 50,
  },
});
