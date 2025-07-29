import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ExamResult } from '../types/types';
import { ArrowLeft } from 'lucide-react-native';

type ResultsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results'>;

const ResultsScreen = () => {
  const navigation = useNavigation<ResultsScreenNavigationProp>();
  const route = useRoute();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color="#4B5563" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Your Results</Text>
{/* 
      <View style={styles.resultCard}>
        <Text style={styles.resultText}>Name: {result.name}</Text>
        <Text style={styles.resultText}>Type: {result.type}</Text>
        <Text style={styles.resultText}>Level: {result.level}</Text>
        <Text style={styles.resultText}>Correct: {result.correct}</Text>
        <Text style={styles.resultText}>Wrong: {result.wrong}</Text>
        <Text style={styles.resultText}>Total: {result.total}</Text>
        <Text style={styles.resultText}>Accuracy: {result.accuracy}%</Text>
        <Text style={styles.resultText}>
          Time Spent: {Math.floor(result.timeSpent / 60)} min {result.timeSpent % 60} sec
        </Text>
      </View> */}

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MainTabs')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ResultsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F4F6',
    flexGrow: 1,
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#4B5563',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 30,
  },
  resultText: {
    fontSize: 18,
    color: '#111827',
    textAlign: 'left',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
