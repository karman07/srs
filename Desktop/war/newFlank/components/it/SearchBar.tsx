import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SearchBar() {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="gray" style={styles.icon} />
      <TextInput placeholder="Search category" style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", padding: 10, borderWidth: 1, borderRadius: 10, borderColor: "#ccc" },
  icon: { marginRight: 5 },
  input: { flex: 1 },
});
