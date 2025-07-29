// navigation/AppNavigator.tsx
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MainTabs from './MainTabs';
import ExamDetailsScreen from '../screens/ExamDetailsScreen';
import ResultsScreen from '../screens/ResultsScreen';
import { ExamScreen } from '../screens/ExamScreen';

import { RootStackParamList } from '../types/types';
import { ExamProvider } from '../context/ExamContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppStack() {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="ExamDetails" component={ExamDetailsScreen} />
          <Stack.Screen name="Exam" component={ExamScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [isSplashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 2000); // show splash for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <ExamProvider>
          {isSplashVisible ? <SplashScreen /> : <AppStack />}
      </ExamProvider>
    </AuthProvider>
  );
}
