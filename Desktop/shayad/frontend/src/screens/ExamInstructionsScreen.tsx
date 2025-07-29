import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors } from '../constants/colors';
import { useExam } from '../context/ExamContext';
import { Button } from '../components/common/Button';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface ExamDetailsScreenProps {
  route: any;
  navigation: any;
}

export const ExamDetailsScreen: React.FC<ExamDetailsScreenProps> = ({ route, navigation }) => {
  const { type, level } = route.params;
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  const { examData, loading, fetchExamData } = useExam();

  useEffect(() => {
    fetchExamData({ type, level });
  }, [type, level]);

  const handleStartExam = () => {
    navigation.navigate('ExamInstructions', { type, level });
  };

  if (loading) {
    return <LoadingSpinner message="Loading exam details..." />;
  }

  if (!examData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>No data available.</Text>
      </View>
    );
  }

  const levelData = examData[level];
  if (!levelData) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Level data not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {type.replace('-', ' ').toUpperCase()} - {level.toUpperCase()}
      </Text>

      <Button
        title="Start the Exam"
        onPress={handleStartExam}
        size="large"
        style={styles.startButton}
      />

      <View style={styles.sectionList}>
        {Object.entries(levelData)
          .filter(([key]) => key !== 'Total')
          .map(([key, value]: any, index) => (
            <View key={key} style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Section {key}</Text>
              <View style={styles.cardDetails}>
                <Detail label="Digits" value={value.Digit || value.Multi1 || value.Div1 || 'N/A'} color={colors.text} />
                <Detail label="Questions" value={value.Questions} color={colors.text} />
                <Detail label="Rows" value={value.Rows || value.Multi2 || value.Div2 || 'N/A'} color={colors.text} />
                <Detail
                  label="Multiplication"
                  value={value.multiplication ? 'Yes' : 'No'}
                  color={colors.text}
                />
                <Detail
                  label="Division"
                  value={value.division ? 'Yes' : 'No'}
                  color={colors.text}
                />
              </View>
            </View>
          ))}
      </View>

      <View style={[styles.totalCard, { backgroundColor: colors.accent }]}>
        <Text style={styles.totalText}>Total Questions: {levelData.Total}</Text>
      </View>

      <Button
        title="Start the Exam"
        onPress={handleStartExam}
        size="large"
      />
    </ScrollView>
  );
};

const Detail = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color }]}>{label}</Text>
    <Text style={[styles.detailValue, { color }]}>{value}</Text>
  </View>
);


const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  startButton: {
    marginBottom: 20,
    borderRadius: 10,
  },
  sectionList: {
    gap: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  totalCard: {
    marginVertical: 24,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
