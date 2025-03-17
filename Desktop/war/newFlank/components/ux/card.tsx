import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface CardProps {
  emoji: string;
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ emoji, title, description }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  emoji: {
    fontSize: 40, // Make the emoji stand out
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default Card;
