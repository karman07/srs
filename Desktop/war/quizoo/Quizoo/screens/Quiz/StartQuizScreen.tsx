import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { RootStackParamList } from '../../types/types'; // Adjust import according to your file structure
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomButton from '../../components/CustomButton';

type ScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'StartQuiz'>; 

const QuizSettingsScreen = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'StartQuiz'>>(); // Update route type here

  const { grade, subject, chapter } = route.params;

  const [numQuestions, setNumQuestions] = useState('5'); // Default to 5 questions
  const [difficulty, setDifficulty] = useState('Medium');
  const [time, setTime] = useState('5'); // Default to 5 minutes

  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleStartQuiz = () => {
    if (!numQuestions || isNaN(Number(numQuestions))) {
      Alert.alert('Error', 'Please enter a valid number of questions.');
      return;
    }

    navigation.navigate('QuizScreen', {
      grade,
      subject,
      chapter,
      numberOfQuestions: Number(numQuestions),
      difficulty
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Quiz Settings</Text>

        <Text style={styles.label}>Grade:</Text>
        <TextInput
          style={styles.input}
          value={grade}
          editable={false}
        />

        <Text style={styles.label}>Subject:</Text>
        <TextInput
          style={styles.input}
          value={subject}
          editable={false}
        />

        <Text style={styles.label}>Chapter:</Text>
        <TextInput
          style={styles.input}
          value={chapter}
          editable={false}
        />

        <Text style={styles.label}>Number of Questions:</Text>
        <Picker
          selectedValue={numQuestions}
          onValueChange={(itemValue) => setNumQuestions(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="5" value="5" />
          <Picker.Item label="10" value="10" />
          <Picker.Item label="15" value="15" />
          <Picker.Item label="20" value="20" />
          <Picker.Item label="25" value="25" />
        </Picker>

        <Text style={styles.label}>Difficulty:</Text>
        <Picker
          selectedValue={difficulty}
          onValueChange={(itemValue) => setDifficulty(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Easy" value="Easy" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Hard" value="Hard" />
        </Picker>

        <Text style={styles.label}>Time (in minutes):</Text>
        <Picker
          selectedValue={time}
          onValueChange={(itemValue) => setTime(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="5" value="5" />
          <Picker.Item label="10" value="10" />
          <Picker.Item label="15" value="15" />
          <Picker.Item label="20" value="20" />
          <Picker.Item label="30" value="30" />
        </Picker>

        <CustomButton title="Start Quiz" onPress={handleStartQuiz} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
});

export default QuizSettingsScreen;
