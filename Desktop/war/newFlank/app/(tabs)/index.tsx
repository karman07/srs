import { useState, useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import SplashScreen from "../splash";
import HomeScreen from "../HomeScreen";
import { useNavigation } from "expo-router";
import { StatusBar } from "react-native";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#116530" barStyle="light-content" />
      {isLoading ? <SplashScreen /> : <HomeScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
