import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardStat from '../components/CardStat';
import { darkColors, lightColors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ExamType, RootStackParamList } from '../types/types';
import { useExam } from '../context/ExamContext'; // ✅ Import context

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState('Home');
  const [previousExams, setPreviousExams] = useState<string[]>([]);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const theme = useColorScheme();
  const themeColors = theme === 'dark' ? darkColors : lightColors;
  const navigation = useNavigation<NavigationProp>();

  const {
    resetScores,
    setExamData,
    setExamResult,
    setCurrentExamType,
    setCurrentLevel,
    setIsExamActive,
    setCurrentPage,
    setTimeRemaining,
  } = useExam(); // ✅ Extract setters from context

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

  useEffect(() => {
    // ✅ Reset all exam-related context state
    resetScores();
    setCurrentExamType('');
    setCurrentLevel('');
    setIsExamActive(false);
    setCurrentPage(1);
    setTimeRemaining(1 * 60); // 15 minutes

    const fetchData = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const completed = examList.map(e => e.key).filter(key => keys.includes(key));
      setPreviousExams(completed);

      const level = await AsyncStorage.getItem('level');
      if (level) setUserLevel(level);
    };

    fetchData();
  }, [activeTab]);

  const handleStartExam = async (examKey: string, type: ExamType) => {
    if (!userLevel) {
      Alert.alert('Level not found', 'User level is missing in local storage.');
      return;
    }

    await AsyncStorage.setItem(examKey, 'completed');
    setPreviousExams(prev => [...prev, examKey]);

    navigation.navigate('ExamDetails', {
      type,
      level: userLevel,
    });
  };

  const isExamCompleted = (key: string) => previousExams.includes(key);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'Home' && (
          <>
            {examList
              .filter(exam => !isExamCompleted(exam.key))
              .map((exam, index) => (
                <CardStat
                  key={index}
                  title={exam.title}
                  description={exam.description}
                  color={themeColors.primary}
                  showButton
                  onStart={() => handleStartExam(exam.key, exam.type)}
                />
              ))}

            {previousExams.length === examList.length && (
              <CardStat
                title="All Exams Completed"
                description="You have completed all the available exams. Great job!"
                color="#9E9E9E"
              />
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  content: {
    marginTop: 10,
  },
});
