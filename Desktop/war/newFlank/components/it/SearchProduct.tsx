import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  Text,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Product } from "@/types/types";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Define the type for navigation
type RootStackParamList = {
  ProductView: { productId: string };
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, "ProductView">;

interface SearchProductProps {
  products: Product[];
  setFilteredProducts: (products: Product[]) => void;
}

export default function SearchProduct({ products, setFilteredProducts }: SearchProductProps) {
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setLocalFilteredProducts] = useState<Product[]>([]);
  const navigation = useNavigation<NavigationProps>(); // Use typed navigation

  const handleSearch = (text: string) => {
    setSearchText(text);

    if (text.trim() === "") {
      setLocalFilteredProducts([]);
      setFilteredProducts([]);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(text.toLowerCase().trim())
      );
      setLocalFilteredProducts(filtered);
      setFilteredProducts(filtered);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={22} color="gray" style={styles.icon} />
        <TextInput
          placeholder="Search for products..."
          style={styles.input}
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#aaa"
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Show search results only when text is entered */}
      {searchText.trim() !== "" && (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("ProductView", { productId: item._id })}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                  {item.name}
                </Text>
                <Text style={styles.price}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.noResults}>No products found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    backgroundColor: "#f7f7f7",
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16, color: "#333" },
  listContainer: { marginTop: 10 },
  noResults: { textAlign: "center", color: "gray", fontSize: 16, marginTop: 20 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  price: { fontSize: 14, color: "#116530" },
});
