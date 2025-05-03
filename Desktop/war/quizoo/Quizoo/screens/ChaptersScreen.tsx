import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { fetchChaptersBySubject, Chapter } from '../utils/chapters';
import Colors from '../constants/Colors';
import { Card } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../types/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ChaptersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chapters'>; 

const ChaptersScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<ChaptersScreenNavigationProp>();
  const { grade, subject } = route.params;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [filteredChapters, setFilteredChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const getChapters = async () => {
      setLoading(true);
      const result = await fetchChaptersBySubject(grade, subject);
      setChapters(result);
      setFilteredChapters(result);
      setLoading(false);
    };

    getChapters();
  }, [grade, subject]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredChapters(chapters);
    } else {
      const lowerQuery = query.toLowerCase();
      const filtered = chapters.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(lowerQuery) ||
          chapter.number.toLowerCase().includes(lowerQuery)
      );
      setFilteredChapters(filtered);
    }
  };

  const handleChapterClick = (chapter: Chapter) => {
    navigation.navigate('StartQuiz', { chapter: chapter.title, grade: grade, subject:subject}); // Navigating to StartQuiz screen
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="arrow-left" size={22} color={Colors.primary} />
      </TouchableOpacity>

      <Text style={styles.header}>
        {subject} - Grade {grade}
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search chapter..."
        value={searchQuery}
        onChangeText={handleSearch}
        placeholderTextColor="#999"
      />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching chapters for {subject}...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChapters}
          keyExtractor={(item, index) => `${item.number}-${index}`}
          renderItem={({ item, index }) => (
            <Animatable.View animation="fadeInUp" delay={index * 80} style={styles.chapterCardWrapper}>
              <Card style={styles.chapterCard} onPress={() => handleChapterClick(item)}>
                <Card.Content>
                  <Text style={styles.chapterText}>{item.number}: {item.title}</Text>
                </Card.Content>
              </Card>
            </Animatable.View>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16, backgroundColor: '#f8faff' },
  backButton: { position: 'absolute', top: 20, left: 16, padding: 8, zIndex: 1 },
  header: { fontSize: 24, fontWeight: '800', color: Colors.primary, textAlign: 'center', marginBottom: 10, letterSpacing: 1, marginTop: 30 },
  searchInput: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 4, color: '#333' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: Colors.primary, fontWeight: '600', marginTop: 12 },
  chapterCardWrapper: { marginBottom: 14 },
  chapterCard: { backgroundColor: '#ffffff', borderRadius: 16, elevation: 4, paddingVertical: 18, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  chapterText: { fontSize: 18, fontWeight: '700', color: Colors.primary },
});

export default ChaptersScreen;
