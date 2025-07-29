import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from '../constants/colors';
import { ExamType } from '../types/types';

interface ExamItem {
  title: string;
  key: string;
  description: string;
}

 const examList = [
    {
      key: 'Speed Examination 2023',
      title: 'Speed Examination 2023',
      description: '250 questions to be solved in 15 mins as fast as possible.',
      type: ExamType.SPEED,
    },
    {
      key: 'Accuracy Exam 2023 (Abacus)',
      title: 'Accuracy Exam (Abacus)',
      description: '50 questions with abacus in 15 mins for accuracy.',
      type: ExamType.ACCURACY_ABACUS,
    },
    {
      key: 'Accuracy Exam 2023 (Mentally)',
      title: 'Accuracy Exam (Mentally)',
      description: '50 questions mentally in 15 mins for accuracy.',
      type: ExamType.ACCURACY_MENTALLY,
    },
  ];

export default function PreviousExamsScreen() {
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [completedExams, setCompletedExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompletedExams = async () => {
      const completed: ExamItem[] = [];

      for (const exam of examList) {
        const status = await AsyncStorage.getItem(exam.key);
        if (status === 'completed') {
          completed.push(exam);
        }
      }

      setCompletedExams(completed);
      setLoading(false);
    };

    loadCompletedExams();
  }, []);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primary }]}>
        Completed Exams
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : completedExams.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No completed exams found.
        </Text>
      ) : (
        completedExams.map((exam, index) => (
          <View key={index} style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{exam.title}</Text>
            <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
              {exam.description}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
