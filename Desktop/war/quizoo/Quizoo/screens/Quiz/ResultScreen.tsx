import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PieChart } from 'react-native-chart-kit';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../../components/CustomButton';

const screenWidth = Dimensions.get('window').width;

type ResultScreenProps = {
  route: RouteProp<RootStackParamList, 'ResultScreen'>;
};

const ResultScreen: React.FC<ResultScreenProps> = ({ route }) => {
  const { correct, wrong, unanswered, subject, chapter, grade, quizNumber } = route.params;
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const saveResult = async () => {
      const time = await AsyncStorage.getItem('quizTime');
      const parsedTime = time ? parseInt(time) : 0;
      setTimeTaken(parsedTime);

      const timestamp = new Date().toISOString();
      const resultData = {
        correct,
        wrong,
        unanswered,
        subject,
        chapter,
        time: parsedTime,
        timestamp,
      };

      const previous = await AsyncStorage.getItem('quizHistory');
      const history = previous ? JSON.parse(previous) : [];
      history.push(resultData);
      await AsyncStorage.setItem('quizHistory', JSON.stringify(history));
    };

    saveResult();
  }, []);

  const chartData = [
    { name: 'Correct', population: correct, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'Wrong', population: wrong, color: '#F44336', legendFontColor: '#333', legendFontSize: 14 },
    { name: 'Unanswered', population: unanswered, color: '#FFC107', legendFontColor: '#333', legendFontSize: 14 },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 Quiz Summary</Text>

      <PieChart
        data={chartData}
        width={screenWidth - 40}
        height={240}
        chartConfig={chartConfig}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      <View style={styles.card}><Text style={styles.label}>✅ Correct Answers</Text><Text style={styles.value}>{correct}</Text></View>
      <View style={styles.card}><Text style={styles.label}>❌ Wrong Answers</Text><Text style={styles.value}>{wrong}</Text></View>
      <View style={styles.card}><Text style={styles.label}>⏳ Unanswered</Text><Text style={styles.value}>{unanswered}</Text></View>
      <View style={styles.card}><Text style={styles.label}>🕒 Time Taken</Text><Text style={styles.value}>{Math.floor(timeTaken / 60)}m {(timeTaken % 60).toString().padStart(2, '0')}s</Text></View>
      <View style={styles.card}><Text style={styles.label}>📘 Subject</Text><Text style={styles.value}>{subject}</Text></View>
      <View style={styles.card}><Text style={styles.label}>📖 Chapter</Text><Text style={styles.value}>{chapter}</Text></View>

      <CustomButton
        title="View Full Quiz Summary"
        onPress={() => navigation.navigate('QuizSummaryScreen', {
          grade,
          quizNumber,
          subject,
          chapter,
        })}
      />
    </ScrollView>
  );
};

export default ResultScreen;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: () => '#000',
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    color: '#888',
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
});
