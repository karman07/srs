import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { RootStackParamList } from '../../types/types';
import Colors from '../../constants/Colors';

interface QuizSummaryProps {
  route: RouteProp<RootStackParamList, 'QuizSummaryScreen'>;
  navigation: NativeStackNavigationProp<RootStackParamList, 'QuizSummaryScreen'>;
}

interface StoredQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface StoredQuizData {
  questions: StoredQuestion[];
  userAnswers: Record<number, string>;
  timeTaken: number;
}

const QuizSummaryScreen: React.FC<QuizSummaryProps> = ({ route }) => {
  const { grade, subject, chapter, quizNumber } = route.params;
  const quizKey = `${grade}_${subject}_${chapter}_QuizNumber(${quizNumber})`;
  
  const [quizData, setQuizData] = useState<StoredQuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuizData = async () => {
      try {
        const stored = await AsyncStorage.getItem(quizKey);
        console.log('Stored:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          setQuizData(parsed); // ✅ Correct way
        }
      } catch (err) {
        console.error('Error loading quiz data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 10 }}>Loading Summary...</Text>
      </View>
    );
  }

  if (!quizData) {
    return (
      <View style={styles.center}>
        <Text>No data found for this quiz.</Text>
      </View>
    );
  }

  return (
    <Animatable.View animation="fadeInUp" duration={600} delay={100} style={styles.container}>
      <ScrollView>
        <Text style={styles.heading}>Quiz Summary</Text>
        <Text style={styles.subheading}>
          Grade: {grade} | Subject: {subject} | Chapter: {chapter} | Quiz #{quizNumber}
        </Text>
        <Text style={styles.time}>
          Time Taken: {Math.floor(quizData.timeTaken / 60)}:
          {(quizData.timeTaken % 60).toString().padStart(2, '0')} mins
        </Text>

        {quizData.questions.map((q, idx) => {
          const userAnswer = quizData.userAnswers[idx] ?? '';
          const isCorrect = userAnswer === q.correctAnswer;

          return (
            <Animatable.View
              key={idx}
              animation="fadeInUp"
              delay={idx * 100}
              style={styles.questionBlock}
            >
              <Text style={styles.question}>Q{idx + 1}: {q.question}</Text>

              {q.options.map((opt, i) => {
                const isUserSelected = userAnswer === opt;
                const isCorrectAnswer = q.correctAnswer === opt;

                return (
                  <View
                    key={i}
                    style={[
                      styles.option,
                      isCorrectAnswer && styles.correctAnswer,
                      isUserSelected && !isCorrectAnswer && styles.incorrectAnswer,
                    ]}
                  >
                    <Text style={styles.optionText}>
                      {opt}
                      {isCorrectAnswer ? ' ✅' : ''}
                      {isUserSelected && !isCorrectAnswer ? ' ❌' : ''}
                    </Text>
                  </View>
                );
              })}

              <Text style={styles.selected}>
                Your Answer: {userAnswer || 'Not Answered'}
              </Text>
              <Text style={styles.correct}>
                Correct Answer: {q.correctAnswer}
              </Text>
            </Animatable.View>
          );
        })}
      </ScrollView>
    </Animatable.View>
  );
};

export default QuizSummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    marginBottom: 10,
    color: Colors.text,
    textAlign: 'center',
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.text,
    textAlign: 'center',
  },
  questionBlock: {
    marginBottom: 25,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    borderColor: '#ddd',
    borderWidth: 1,
    elevation: 2,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  option: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  correctAnswer: {
    backgroundColor: '#d4fcd4',
    borderColor: 'green',
  },
  incorrectAnswer: {
    backgroundColor: '#ffe0e0',
    borderColor: 'red',
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
  },
  selected: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  correct: {
    fontSize: 14,
    color: 'green',
    fontWeight: '600',
  },
});
