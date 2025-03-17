import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/types"; // Import the types

interface HeaderProps {
  cartCount: number;
}

export default function Header({ cartCount }: HeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>Hello, User</Text>
      <TouchableOpacity
        style={styles.cartButton}
        onPress={() => navigation.navigate("Cart")}
      >
        <MaterialCommunityIcons name="cart-outline" size={28} color="black" />
        {cartCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartCount}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 20,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
  },
  cartButton: {
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartCount: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
