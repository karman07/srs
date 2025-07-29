import React from 'react';
import { useColorScheme } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import PreviousExamsScreen from '../screens/PreviousScreen';
import { darkColors, lightColors } from '../constants/colors';

const Tab = createMaterialTopTabNavigator();

export default function MainTabs() {
  const theme = useColorScheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }}>
      <Tab.Navigator
        screenOptions={{
          tabBarIndicatorStyle: {
            backgroundColor: colors.accent,
            height: 3,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#ffffff',
          tabBarStyle: {
            backgroundColor: colors.primary,
            elevation: 4,
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 14,
          },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Previous" component={PreviousExamsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}
