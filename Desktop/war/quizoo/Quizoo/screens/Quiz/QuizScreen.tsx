import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchQuizQuestions, QuizQuestion } from '../../utils/questions';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../../constants/Colors';

interface QuizScreenProps {
  route: RouteProp<RootStackParamList, 'QuizScreen'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuizScreen'>;
}

const QuizScreen: React.FC<QuizScreenProps> = ({ route, navigation }) => {
  const { grade, subject, chapter, numberOfQuestions, difficulty } = route.params;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<{ selectedAnswer: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const baseKey = `${grade}_${subject}_${chapter}`;

  const [quizKey, setQuizKey] = useState<string>('');
  const [quizNumber, setquizNumber] = useState(0)
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      const fetchedQuestions = await fetchQuizQuestions(
        grade,
        subject,
        chapter,
        numberOfQuestions,
        difficulty
      );
      setQuestions(fetchedQuestions);
      setLoading(false);
      startTimer();

      // Get all keys and find existing quiz keys
      const allKeys = await AsyncStorage.getAllKeys();
      const existingQuizNumbers = allKeys
        .filter((key) => key.startsWith(baseKey + '_QuizNumber('))
        .map((key) => {
          const match = key.match(/QuizNumber\((\d+)\)/);
          return match ? parseInt(match[1], 10) : 0;
        });

      const nextQuizNumber = existingQuizNumbers.length > 0 ? Math.max(...existingQuizNumbers) + 1 : 1;
      setquizNumber(nextQuizNumber)
      const fullKey = `${baseKey}_QuizNumber(${nextQuizNumber})`;
      setQuizKey(fullKey);

      console.log(fullKey)

      const quizData = {
        questions: fetchedQuestions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
        userAnswers: {},
        timeTaken: 0,
      };

      await AsyncStorage.setItem(fullKey, JSON.stringify(quizData));

      setCurrentIndex(0); // Start from the first question
    };

    loadQuiz();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    intervalRef.current = setInterval(() => setTimer((prev) => prev + 1), 1000);
  };

  const handleAnswer = (option: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { selectedAnswer: option };
      return updated;
    });
  };

  const handleSkip = () => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: '' }));
    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[currentIndex] = { selectedAnswer: '' };
      return updated;
    });
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleSubmit = async () => {
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q, index) => {
      const userAnswer = answers[index];
      if (!userAnswer) unanswered++;
      else if (userAnswer === q.correctAnswer) correct++;
      else wrong++;
    });

    const storedData = await AsyncStorage.getItem(quizKey);
    const parsedData = storedData ? JSON.parse(storedData) : null;

    if (parsedData) {
      parsedData.userAnswers = answers;
      parsedData.timeTaken = timer;
      await AsyncStorage.setItem(quizKey, JSON.stringify(parsedData));
    }

    intervalRef.current && clearInterval(intervalRef.current);

    navigation.replace('ResultScreen', {
      correct,
      wrong,
      unanswered,
      subject,
      chapter,
      grade,
      quizNumber
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading Questions...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>
        Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
      </Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.options.map((option, idx) => {
          const isSelected = answers[currentIndex] === option;
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            style={[styles.navButton, currentIndex === 0 && styles.disabled]}
          >
            <Text style={styles.navText}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.navText}>Skip</Text>
          </TouchableOpacity>

          {currentIndex < questions.length - 1 ? (
            <TouchableOpacity onPress={handleNext} style={styles.navButton}>
              <Text style={styles.navText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
              <Text style={styles.navText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default QuizScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 20,
    color: Colors.text,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
  },
  selectedOption: {
    backgroundColor: '#e0d5ff',
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 16,
    color: Colors.text,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  navButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  skipButton: {
    backgroundColor: Colors.gray,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  submitButton: {
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  navText: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
  },
});
