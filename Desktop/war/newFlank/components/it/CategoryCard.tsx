import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface CategoryCardProps {
  name: string;
  image: any;
}

export default function CategoryCard({ name, image }: CategoryCardProps) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} />
      <Text style={styles.text}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e8ffe3", // ✅ Set the background color
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 100, // Adjust size as needed
    marginHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
    marginBottom: 10,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "bold", // ✅ Makes text bold
    textAlign: "center",
    color: "#333",
  },
});
