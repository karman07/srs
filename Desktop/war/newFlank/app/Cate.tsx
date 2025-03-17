import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { fetchCategories } from "@/services/api";
import { Category } from "@/types/types";
import CategoryCard from "@/components/it/CategoryCard";

export default function CategoryScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const categoryData = await fetchCategories();
      setCategories(categoryData);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#116530" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* ✅ Title */}
      <Text style={styles.title}>Categories</Text>

      {/* ✅ FlatList for displaying categories in 3 columns */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item._id}
        numColumns={3} // ✅ Display 3 categories per row
        columnWrapperStyle={styles.row} // ✅ Even spacing between items
        contentContainerStyle={styles.listContainer} // ✅ Padding
        renderItem={({ item }) => (
          <CategoryCard name={item.name} image={{ uri: item.imageUrl }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  error: {
    textAlign: "center",
    color: "red",
    fontSize: 16,
    marginTop: 20,
  },
});
