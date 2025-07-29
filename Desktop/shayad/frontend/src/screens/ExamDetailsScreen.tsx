import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "../constants/colors";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/types";
import { useExam } from "../context/ExamContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  route: RouteProp<RootStackParamList, "ExamDetails">;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExamDetailsScreen({ route }: Props) {
  const { type, level } = route.params;
  const theme = useColorScheme();
  const colors = theme === "dark" ? darkColors : lightColors;
  const navigation = useNavigation<NavigationProp>();
  const { examData, loading, fetchExamData } = useExam();

  useEffect(() => {
    fetchExamData({ type, level });
  }, [type, level]);

  const handleStartExam = () => {
    navigation.navigate("Exam", { type, level });
  };

  const currentLevelData = examData?.[level];

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!currentLevelData || !currentLevelData.data) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          No exam data available for this level.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {type.replace("-", " ").toUpperCase()} - {level.toUpperCase()}
      </Text>

      {Object.entries(currentLevelData.data)
        .filter(([key]) => key !== "Total")
        .map(([sectionKey, sectionData]: [string, any]) => (
          <View
            key={sectionKey}
            style={[styles.card, { backgroundColor: colors.card }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Section {sectionKey}
            </Text>
            <View style={styles.cardDetails}>
              <Detail
                label="Digits"
                value={sectionData.Digit ?? sectionData.Mul1 ?? "N/A"}
                color={colors.text}
              />
              <Detail
                label="Questions"
                value={sectionData.Questions ?? sectionData.Mul2 ?? "N/A"}
                color={colors.text}
              />
              <Detail
                label="Rows"
                value={sectionData.Rows ?? "N/A"}
                color={colors.text}
              />
              <Detail
                label="Multiplication"
                value={sectionData.multiplication ? "Yes" : "No"}
                color={colors.text}
              />
              <Detail
                label="Division"
                value={sectionData.division ? "Yes" : "No"}
                color={colors.text}
              />
            </View>
          </View>
        ))}

      <TouchableOpacity
        style={[styles.buttonSecondary, { backgroundColor: colors.accent }]}
        onPress={handleStartExam}
      >
        <Text style={styles.buttonText}>Start the Exam</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Detail = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color }]}>{label}</Text>
    <Text style={[styles.detailValue, { color }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  cardDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttonSecondary: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    elevation: 3,
    marginTop: 24,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
