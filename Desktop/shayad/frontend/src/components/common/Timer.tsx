import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../constants/colors';
import { useExam } from '../../context/ExamContext';

interface TimerProps {
  onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({ onTimeUp }) => {
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const { timeRemaining, setTimeRemaining, isExamActive } = useExam();

  useEffect(() => {
    if (!isExamActive || timeRemaining <= 0) {
      if (timeRemaining <= 0) onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev=> {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, isExamActive, onTimeUp, setTimeRemaining]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isUrgent = timeRemaining < 300; // Less than 5 minutes

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: isUrgent ? colors.error : colors.success,
      }
    ]}>
      <Text style={styles.timerText}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  timerText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
});