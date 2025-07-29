import React, { 
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useExam } from '../../context/ExamContext';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../../constants/colors';

interface MultiplicationBoxProps {
  questionNumber: number;
  sno: number;
  multi1: number;
  multi2: number;
  onAnswerCheck?: (correct: boolean) => void;
}

export const MultiplicationBox = forwardRef<any, MultiplicationBoxProps>(
  ({ questionNumber, sno, multi1, multi2, onAnswerCheck }, ref) => {
    const { incrementCorrect, incrementWrong } = useExam();
    const theme = useColorScheme();
    const colors = theme === 'dark' ? darkColors : lightColors;

    const [number1, setNumber1] = useState(0);
    const [number2, setNumber2] = useState(0);
    const [answer, setAnswer] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [attempted, setAttempted] = useState(false);

    // Generate question once and keep it stable
    useEffect(() => {
      generateQuestion();
    }, [questionNumber, multi1, multi2]); // Only regenerate when these specific props change

    const generateQuestion = () => {
      const min1 = Math.pow(10, multi1 - 1);
      const max1 = Math.pow(10, multi1) - 1;
      const min2 = Math.pow(10, multi2 - 1);
      const max2 = Math.pow(10, multi2) - 1;

      const n1 = Math.floor(Math.random() * (max1 - min1 + 1)) + min1;
      const n2 = Math.floor(Math.random() * (max2 - min2 + 1)) + min2;

      setNumber1(n1);
      setNumber2(n2);
      setAnswer(n1 * n2);
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
        correctAnswer: answer
      })
    }));

    const handleInputChange = (value: string) => {
      if (!attempted) {
        setUserInput(value);
      }
    };

    return (
      <View
        style={[
          styles.box,
          {
            borderColor: colors.primary,
            backgroundColor: colors.card,
            shadowColor: colors.shadow,
          },
        ]}
      >
        <Text style={[styles.label, { color: colors.primary }]}>Q{questionNumber}</Text>
        <Text style={[styles.question, { color: colors.text }]}>{number1}</Text>
        <Text style={[styles.operator, { color: colors.text }]}>× {number2}</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: colors.primary,
              backgroundColor: colors.background,
              color: colors.text,
            },
          ]}
          keyboardType="numeric"
          value={userInput}
          onChangeText={handleInputChange}
          placeholder="?"
          placeholderTextColor={colors.textSecondary}
          editable={true}
        />
      </View>
    );
  }
);

const multiplicationStyles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 200,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  operator: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
  },
});


const styles = StyleSheet.create({
  box: {
    width: '100%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: 200,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 14,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  operator: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlign: 'center',
    fontSize: 18,
  },
});
