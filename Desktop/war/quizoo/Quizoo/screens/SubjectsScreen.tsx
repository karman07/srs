import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchSubjectsByGrade, Subject } from '../utils/subject';
import Colors from '../constants/Colors';
import { Card } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window');

const SubjectsScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { grade } = route.params;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const getSubjects = async () => {
      setLoading(true);
      const result = await fetchSubjectsByGrade(grade);
      setSubjects(result);
      setLoading(false);
    };

    getSubjects();
  }, [grade]);

  const handleSubjectPress = (subject: string) => {
    navigation.navigate('Chapters', {
      grade,
      subject,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Subjects in Grade {grade}</Text>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading subjects for Grade {grade}...</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item: Subject, index: number) => `${item.name}-${index}`}
          renderItem={({ item, index }) => (
            <Animatable.View
              animation="fadeInUp"
              delay={index * 120}
              style={styles.subjectCardWrapper}
            >
              <TouchableOpacity onPress={() => handleSubjectPress(item.name)}>
                <Card style={styles.subjectCard}>
                  <Card.Content>
                    <Text style={styles.subjectText}>{item.name}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            </Animatable.View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    backgroundColor: '#f3f6fc',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 8,
    padding: 8,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    marginTop: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 12,
  },
  subjectCardWrapper: {
    marginBottom: 14,
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 4,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});

export default SubjectsScreen;
