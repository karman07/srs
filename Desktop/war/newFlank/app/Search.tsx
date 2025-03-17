import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { fetchProducts } from "@/services/api"; // ✅ API call
import { Product } from "@/types/types";
import SearchProduct from "@/components/it/SearchProduct"; // ✅ Search Bar

export default function SearchScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const productData = await fetchProducts(); // ✅ Fetch products from API
      setProducts(productData);
      setFilteredProducts([]); // Initially, no search results
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Search Bar */}
      <SearchProduct products={products} setFilteredProducts={setFilteredProducts} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  loader: { marginTop: 50, alignSelf: "center" },
  error: { textAlign: "center", color: "red", fontSize: 16, marginTop: 20 },
  noResults: { textAlign: "center", color: "gray", fontSize: 16, marginTop: 20 },
  listContainer: { marginTop: 10, flexGrow: 1, marginBottom:10 },
  productText: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
