import { useEffect, useState } from "react";
import { View, Animated, Image, StyleSheet } from "react-native";

export default function SplashScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("@/assets/images/pic/flag.png")}
        style={[styles.image, { opacity: fadeAnim }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  image: { width: 200, height: 200, resizeMode: "contain" },
});
