import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '../constants/colors';
import { useExam } from '../context/ExamContext';
import { Timer } from '../components/common/Timer';
import { Button } from '../components/common/Button';
import { PageIndicator } from '../components/exam/PageIndicator';
import { QuestionBox } from '../components/exam/QuestionBox';
import { MultiplicationBox } from '../components/exam/MultiplicationBox';
import { DivisionBox } from '../components/exam/DivisionBox';
import { ExamResult } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SectionData {
  sectionId: string;
  multiplication?: boolean;
  division?: boolean;
  Digit?: number;
  Questions?: number;
  Rows?: number;
  Multi1?: number;
  Multi2?: number;
  Div1?: number;
  Div2?: number;
  startIndex?: number;
  endIndex?: number;
}

export const ExamScreen: React.FC<any> = ({ route, navigation }) => {
  const { type, level } = route.params;
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const {
    examData,
    correctAnswers,
    wrongAnswers,
    resetScores,
    setIsExamActive,
    currentPage,
    setCurrentPage,
    submitResults,
    setExamStartTime,
    timeRemaining,
    totalQuestions,
  } = useExam();

  const [allSections, setAllSections] = useState<SectionData[]>([]);
  const [questionsPerPage] = useState(10);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionRefs, setQuestionRefs] = useState<React.RefObject<any>[]>([]);

  useEffect(() => {
    resetScores();
    setIsExamActive(true);
    setExamStartTime(Date.now());
    setCurrentPage(1);
    setCurrentQuestionIndex(0);

    if (examData?.[level]?.data) {
      const currentLevelData = examData[level].data;

      const sections = Object.entries(currentLevelData)
        .filter(([key]) => key !== 'Total')
        .map(([key, value]: [string, any]) => ({
          sectionId: key,
          ...(value as object),
        } as SectionData));

      setAllSections(sections);
    }

    // Initialize refs for questions
    const refs = Array.from({ length: questionsPerPage }, () => React.createRef());
    setQuestionRefs(refs);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  // Update refs when page changes
  useEffect(() => {
    const refs = Array.from({ length: questionsPerPage }, () => React.createRef());
    setQuestionRefs(refs);
  }, [currentPage]);

  const handleBackPress = () => {
    Alert.alert('Exit Exam', 'Are you sure you want to exit the exam? Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
    return true;
  };

  const confirmFinishExam = () => {
    Alert.alert('Finish Exam', 'Are you sure you want to submit your answers?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'destructive', onPress: handleFinishExam },
    ]);
  };

  const handleTimeUp = () => {
    Alert.alert('Time Up!', 'The examination time has ended.', [
      { text: 'OK', onPress: handleFinishExam },
    ]);
  };

  const handleFinishExam = async () => {
    // Check all answers before finishing
    questionRefs.forEach(ref => {
      if (ref.current && ref.current.checkAnswer) {
        ref.current.checkAnswer();
      }
    });

    setIsExamActive(false);
    const totalAnswered = correctAnswers + wrongAnswers;
    const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
    const timeSpent = 15 * 60 - timeRemaining;
    const storedUserName = await AsyncStorage.getItem('username') || 'Anonymous';

    const result: ExamResult = {
      name: storedUserName,
      type,
      level,
      correct: correctAnswers,
      wrong: wrongAnswers,
      total: totalQuestions,
      accuracy,
      timeSpent,
    };

    await submitResults(result);
    navigation.navigate('MainTabs');
  };

  const handleNextPage = () => {
    // Check all answers on current page before moving to next
    questionRefs.forEach(ref => {
      if (ref.current && ref.current.checkAnswer) {
        ref.current.checkAnswer();
      }
    });

    const totalPages = Math.ceil(totalQuestions / questionsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setCurrentQuestionIndex(currentQuestionIndex + questionsPerPage);
    } else {
      confirmFinishExam();
    }
  };

  const getCurrentSectionData = (questionIndex: number): SectionData | null => {
    let cumulative = 0;
    for (const section of allSections) {
      const count = section.Questions || 0;
      if (questionIndex < cumulative + count) {
        return {
          ...section,
          startIndex: cumulative,
          endIndex: cumulative + count - 1,
        };
      }
      cumulative += count;
    }
    return null;
  };

  if (!examData?.[level] || allSections.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Loading exam...</Text>
      </View>
    );
  }

  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View style={styles.headerCenter}>
          <PageIndicator currentPage={currentPage} totalPages={totalPages} />
        </View>
        <View style={styles.headerRight}>
          <Timer onTimeUp={handleTimeUp} />
        </View>
      </View>

      <ScrollView style={styles.questionsContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.questionsGrid}>
          {Array.from({ length: questionsPerPage }, (_, index) => {
            const questionNumber = (currentPage - 1) * questionsPerPage + index + 1;
            const globalQuestionIndex = currentQuestionIndex + index;
            const sectionData = getCurrentSectionData(globalQuestionIndex);

            if (!sectionData || globalQuestionIndex >= totalQuestions) return null;

            return (
              <View key={`${currentPage}-${questionNumber}`} style={styles.questionWrapper}>
                {sectionData.multiplication ? (
                  <MultiplicationBox
                    ref={questionRefs[index]}
                    questionNumber={questionNumber}
                    sno={currentPage}
                    multi1={sectionData.Multi1 || sectionData.Digit || 2}
                    multi2={sectionData.Multi2 || sectionData.Rows || 2}
                  />
                ) : sectionData.division ? (
                  <DivisionBox
                    ref={questionRefs[index]}
                    questionNumber={questionNumber}
                    sno={currentPage}
                    div1={sectionData.Div1 || sectionData.Digit || 2}
                    div2={sectionData.Div2 || sectionData.Rows || 2}
                  />
                ) : (
                  <QuestionBox
                    ref={questionRefs[index]}
                    questionNumber={questionNumber}
                    sno={currentPage}
                    digit={sectionData.Digit || 2}
                    rows={sectionData.Rows || 3}
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <Button
          title={currentPage === totalPages ? 'Finish Exam' : 'Next Page'}
          onPress={handleNextPage}
          size="large"
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCenter: { 
    flex: 1, 
    alignItems: 'center' 
  },
  headerRight: { 
    flex: 1, 
    alignItems: 'flex-end' 
  },
  questionsContainer: { 
    flex: 1 
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  questionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  questionWrapper: {
    width: '45%',
    margin: '2.5%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  nextButton: { 
    flex: 1 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ExamScreen;