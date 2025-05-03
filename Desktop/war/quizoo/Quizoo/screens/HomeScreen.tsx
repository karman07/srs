import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/types';
import { Card } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

const grades = [
  { id: 'V', title: 'Grade V' },
  { id: 'VI', title: 'Grade VI' },
  { id: 'VII', title: 'Grade VII' },
  { id: 'VIII', title: 'Grade VIII' },
  { id: 'IX', title: 'Grade IX' },
  { id: 'X', title: 'Grade X' },
  { id: 'XI', title: 'Grade XI' },
  { id: 'XII', title: 'Grade XII' },
];

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const renderCard = ({ item, index }: { item: typeof grades[0]; index: number }) => (
    <Animatable.View animation="fadeInUp" delay={index * 100} style={styles.cardWrapper}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Subjects', { grade: item.id })}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#ffffff', '#f1f1f1']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Card.Content>
            <Text style={styles.gradeText}>{item.id}</Text>
            <Text style={styles.subtitle}>{item.title}</Text>
          </Card.Content>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#f0f4f7', '#dfe9f3']}
      style={styles.container}
    >
      <Text style={styles.header}>Select Your Grade</Text>
      <FlatList
        data={grades}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  cardWrapper: {
    flex: 1,
    marginHorizontal: 6,
  },
  card: {
    borderRadius: 20,
    elevation: 5,
    paddingVertical: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  gradeText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
});

export default HomeScreen;
