import React from "react";
import { SafeAreaView } from "react-native";
import BottomTabNavigator from "./BottomTabNavigator";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <BottomTabNavigator />
    </SafeAreaView>
  );
}
