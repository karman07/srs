import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/colors';

type Props = {
  title: string;
  description: string;
  color: string;
  showButton?: boolean;
  onStart?: () => void;
};

export default function CardStat({ title, description, color, showButton, onStart }: Props) {
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: color }]}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.text }]}>{description}</Text>

      {showButton && (
        <TouchableOpacity
          onPress={onStart}
          style={[styles.button, { backgroundColor: color }]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Start Exam</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
