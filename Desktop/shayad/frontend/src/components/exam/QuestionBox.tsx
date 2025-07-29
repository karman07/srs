import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../constants/colors';
import { generateRandomNumbers } from '../../utils/numberGenerator';
import { useExam } from '../../context/ExamContext';

interface QuestionBoxProps {
  questionNumber: number;
  sno: number;
  digit: number;
  rows: number;
  onAnswerCheck?: (correct: boolean) => void;
}

export const QuestionBox = forwardRef<any, QuestionBoxProps>(
  ({ questionNumber, sno, digit, rows, onAnswerCheck }, ref) => {
    const { incrementCorrect, incrementWrong } = useExam();
    const theme = useColorScheme();
    const colors = theme === 'dark' ? darkColors : lightColors;

    const [numbers, setNumbers] = useState<number[]>([]);
    const [answer, setAnswer] = useState<number>(0);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [attempted, setAttempted] = useState(false);

    // Generate new question only when questionNumber changes
    useEffect(() => {
      const { numbers: newNumbers, answer: correctAnswer } = generateRandomNumbers(digit, rows);
      setNumbers(newNumbers);
      setAnswer(correctAnswer);
      setUserAnswer('');
      setAttempted(false);
    }, [questionNumber, digit, rows]);

    useImperativeHandle(ref, () => ({
      checkAnswer: () => {
        if (attempted) return;
        
        const parsed = parseInt(userAnswer.trim());
        const correct = !isNaN(parsed) && parsed === answer;
        
        if (correct) {
          incrementCorrect();
        } else {
          incrementWrong();
        }
        
        setAttempted(true);
        onAnswerCheck?.(correct);
      },
      getResult: () => ({
        attempted,
        userAnswer: userAnswer,
        correctAnswer: answer
      })
    }));

    const handleAnswerChange = (value: string) => {
      if (!attempted) {
        setUserAnswer(value);
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerText}>Q{questionNumber}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.numbersContainer}>
            {numbers.map((number, index) => (
              <View
                key={index}
                style={[
                  styles.numberBox,
                  {
                    backgroundColor: index === 0
                      ? colors.success + '20'
                      : number >= 0
                        ? colors.primary + '20'
                        : colors.error + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.numberText,
                    {
                      color: index === 0
                        ? colors.success
                        : number >= 0
                          ? colors.primary
                          : colors.error,
                    },
                  ]}
                >
                  {index === 0 ? number : number >= 0 ? `+ ${number}` : `- ${Math.abs(number)}`}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.primary }]} />

          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
              },
            ]}
            value={userAnswer}
            onChangeText={handleAnswerChange}
            placeholder="?"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            returnKeyType="done"
            editable={true}
          />
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    minHeight: 200,
  },
  header: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  numbersContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  numberBox: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
    minWidth: 60,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 2,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
});
