import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import AuthNavigator from "./screens/auth/AuthNavigator";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import VerifyEmailScreen from "./screens/auth/VerifyEmailScreen";
import { RootStackParamList } from "./types/types";
import Colors from "./constants/Colors"; 
import SubjectsScreen from './screens/SubjectsScreen'; 
import ChaptersScreen from "./screens/ChaptersScreen";
import QuizSettingsScreen from "./screens/Quiz/StartQuizScreen";
import QuizScreen from "./screens/Quiz/QuizScreen";
import ResultScreen from "./screens/Quiz/ResultScreen";
import QuizSummaryScreen from "./screens/Quiz/QuizSummaryScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />

      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Splash"
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
          <Stack.Screen name="Subjects" component={SubjectsScreen} />
          <Stack.Screen name="Chapters" component={ChaptersScreen} />
          <Stack.Screen name="StartQuiz" component={QuizSettingsScreen} />
          <Stack.Screen name="QuizScreen" component={QuizScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen name="QuizSummaryScreen" component={QuizSummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
