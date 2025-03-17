import { store } from "@/store/store";
import { Stack, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Provider } from "react-redux";

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation()
  
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);
  
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000); // Simulate a 2-second splash screen delay
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <Provider store={store}>
    <Stack>
      <Stack.Screen name="splash" options={{ headerShown: false }} />
      <Stack.Screen name="HomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="Cart" options={{ headerShown: false }} />
    </Stack>
    </Provider>
  );
}
