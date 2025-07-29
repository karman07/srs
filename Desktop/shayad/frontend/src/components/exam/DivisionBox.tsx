import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../constants/colors';
import { useExam } from '../../context/ExamContext';

interface DivisionBoxProps {
  questionNumber: number;
  sno: number;
  div1: number;
  div2: number;
  onAnswerCheck?: (correct: boolean) => void;
}

export const DivisionBox = forwardRef<any, DivisionBoxProps>(
  ({ questionNumber, sno, div1, div2, onAnswerCheck }, ref) => {
    const { incrementCorrect, incrementWrong } = useExam();
    const theme = useColorScheme();
    const colors = theme === 'dark' ? darkColors : lightColors;

    const [number1, setNumber1] = useState(0);
    const [number2, setNumber2] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [attempted, setAttempted] = useState(false);

    useEffect(() => {
      generateQuestion();
    }, [questionNumber, div1, div2]);

    const generateQuestion = () => {
      const min1 = Math.pow(10, div1 - 1);
      const max1 = Math.pow(10, div1) - 1;
      const min2 = Math.pow(10, div2 - 1);
      const max2 = Math.pow(10, div2) - 1;

      let attempt = 0;
      const maxAttempts = 100;
      let n1 = 0;
      let n2 = 0;
      let quotient = 0;

      while (attempt < maxAttempts) {
        quotient = Math.floor(Math.random() * 90) + 10; // 2-digit quotient
        n2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;
        if (n2 <= 1) n2 = 2;
        n1 = quotient * n2;

        if (n1 >= min1 && n1 <= max1) {
          setNumber1(n1);
          setNumber2(n2);
          setAnswer(quotient);
          setUserInput('');
          setAttempted(false);
          return;
        }

        attempt++;
      }

      // Fallback if no valid question was found
      console.warn('Failed to generate valid division question. Using fallback.');
      setNumber1(100);
      setNumber2(10);
      setAnswer(10);
      setUserInput('');
      setAttempted(false);
    };

    useImperativeHandle(ref, () => ({
      checkAnswer: () => {
        if (attempted) return;

        const parsed = parseInt(userInput.trim());
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
        userAnswer: userInput,
        correctAnswer: answer,
      }),
    }));

    const handleInputChange = (value: string) => {
      if (!attempted) {
        setUserInput(value);
      }
    };

    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerText}>Q{questionNumber}</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.questionBox, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.questionText, { color: colors.primary }]}>
              {number1} ÷ {number2}
            </Text>
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
            value={userInput}
            onChangeText={handleInputChange}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionBox: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    height: 2,
    width: '100%',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
});
