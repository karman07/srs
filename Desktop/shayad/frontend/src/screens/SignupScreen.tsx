import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/types';
import { useThemeContext } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [level, setLevel] = useState('');
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useThemeContext();

  const handleSignup = async () => {
    if (username && password && level) {
      navigation.navigate('Login');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemeToggle />
      <Text style={[styles.title, { color: colors.primary }]}>Signup</Text>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Level"
        value={level}
        onChangeText={setLevel}
        style={styles.input}
        mode="outlined"
      />
      <Button mode="contained" onPress={handleSignup} style={styles.button}>
        Signup
      </Button>
      <Text style={[styles.link, { color: colors.primary }]} onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  input: { marginBottom: 16 },
  button: { marginTop: 12 },
  link: { marginTop: 20, textAlign: 'center', fontSize: 14 },
});
