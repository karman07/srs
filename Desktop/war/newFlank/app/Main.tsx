import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { fetchCategories, fetchProducts } from "@/services/api";
import { Category, Product } from "@/types/types";
import CategoryCard from "@/components/it/CategoryCard";
import ProductCard from "@/components/it/ProductCard";
import Header from "@/components/it/Header";
import Carousel from "@/components/it/Carousel";
import SearchProduct from "@/components/it/SearchProduct"; // ✅ Import SearchProduct Component

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // ✅ FIX: Added state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Get cart count from Redux
  const cartCount = useSelector((state: RootState) => state.cart.cart.length);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const categoryData = await fetchCategories();
      const productData = await fetchProducts();
      setCategories(categoryData);
      setProducts(productData);
    } catch (err) {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color="blue" style={styles.loader} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  // ✅ Group products by cuisine
  const groupedProducts = (filteredProducts.length > 0 ? filteredProducts : products).reduce(
    (acc, product) => {
      if (!acc[product.crusine]) acc[product.crusine] = [];
      acc[product.crusine].push(product);
      return acc;
    },
    {} as Record<string, Product[]>
  );

  return (
    <View style={styles.container}>
      {/* ✅ Header with Dynamic Cart Count */}
      <Header cartCount={cartCount} />

      {/* ✅ Search Product Component */}
      <SearchProduct products={products} setFilteredProducts={setFilteredProducts} />

      {/* ✅ Main Scrollable Content */}
      <ScrollView style={styles.mainContent}>
        {/* ✅ Carousel Section */}
        <Text style={styles.sectionTitle}>📸 Explore Trending</Text>
        <Carousel />

        {/* ✅ Categories Section */}
        <Text style={styles.sectionTitle}>📂 Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
          {categories.map((category) => (
            <CategoryCard key={category._id} name={category.name} image={{ uri: category.imageUrl }} />
          ))}
        </ScrollView>

        {/* ✅ Cuisine-wise Products Section */}
        {Object.entries(groupedProducts).map(([cuisine, items]) => (
          <View key={cuisine}>
            <Text style={styles.sectionTitle}>🍽️ {cuisine} Dishes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.row}>
              {items.map((product) => (
                <ProductCard
                  key={product._id}
                  _id={product._id}
                  name={product.name}
                  price={`${product.price}`}
                  weight={product.weight}
                  image={{ uri: product.imageUrl }}
                  description={product.description}
                  crusine={product.crusine}
                />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  mainContent: { flex: 1 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
  row: { flexDirection: "row", marginVertical: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 50 },
  error: { textAlign: "center", color: "red", fontSize: 16, marginTop: 20 },
});
