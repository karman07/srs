import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  incrementQuantity,
  decrementQuantity,
} from "@/store/cartSlice";
import { fetchProductById, fetchProductsByCuisine } from "@/services/api";
import { Product, CartItem } from "@/types/product";
import { RootState } from "@/store/store";
import ProductCard from "@/components/it/ProductCard";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  ProductView: { productId: string };
};

type ProductViewScreenProps = {
  route: RouteProp<RootStackParamList, "ProductView">;
};

export default function ProductViewScreen({ route }: ProductViewScreenProps) {

  
  const { productId } = route.params;
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cartItem = useSelector((state: RootState) =>
    state.cart.cart.find((item) => item._id === productId)
  );

  const cardData = [
    {
      id: "1",
      emoji: "🔥",
      title: "Hot Deal",
      description: "Limited-time offer!",
    },
    {
      id: "2",
      emoji: "⭐",
      title: "Top Rated",
      description: "Highly reviewed product!",
    },
    {
      id: "3",
      emoji: "🚀",
      title: "Fast Shipping",
      description: "Delivered in 2 days!",
    },
    {
      id: "4",
      emoji: "💰",
      title: "Best Price",
      description: "Get it at the lowest cost!",
    },
  ];

  useEffect(() => {
    const getProductDetails = async () => {
      try {
        const data = await fetchProductById(productId);
        setProduct(data as Product);
        if (data?.crusine) {
          const similarData = await fetchProductsByCuisine(data.crusine);
          setSimilarProducts(similarData);
        }
      } catch (err) {
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
      }
    };

    getProductDetails();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      const cartItem: CartItem = { ...product, quantity: 1 };
      dispatch(addToCart(cartItem));
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="green" style={styles.loader} />
    );
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!product) return <Text style={styles.error}>Product not found.</Text>;

  return (
    <View style={styles.container2}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => {
            navigation.navigate("MainTabs", { screen: "Search" });
          }}
        >
          <Ionicons name="search" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container}>
        <Image
          source={{
            uri: product.imageUrl,
          }}
          style={styles.image}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price}</Text>
          <Text style={styles.weight}>⚖️ Weight: {product.weight}</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Add to Cart / Increment-Decrement Section */}
          {cartItem ? (
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => dispatch(decrementQuantity(product._id))}
              >
                <AntDesign name="minus" size={22} color="#116530" />
              </TouchableOpacity>
              <Text style={styles.quantity}>{cartItem.quantity}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => dispatch(incrementQuantity(product._id))}
              >
                <AntDesign name="plus" size={22} color="#116530" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAddToCart}
              style={styles.addToCartButton}
            >
              <Text style={styles.addToCartText}>🛒 Add to Cart</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Similar Products Section */}
        <Text style={styles.sectionTitle}>Similar Products</Text>
        <FlatList
          data={similarProducts}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              _id={item._id}
              name={item.name}
              price={item.price}
              weight={item.weight}
              image={{ uri: item.imageUrl }}
              description={item.description}
              crusine={item.crusine}
            />
          )}
          contentContainerStyle={styles.similarProductsContainer}
        />

        <Text style={styles.sectionTitle}>Features</Text>
        <FlatList
          data={cardData}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
          )}
          contentContainerStyle={styles.cardContainer}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container2: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },

  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#f8f8f8",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  image: {
    width: "100%",
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  infoContainer: { padding: 10 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 5 },
  price: {
    fontSize: 22,
    color: "#116530",
    fontWeight: "bold",
    marginBottom: 5,
  },
  weight: { fontSize: 16, color: "#666", marginBottom: 10 },
  description: { fontSize: 16, color: "#444", marginBottom: 20 },

  addToCartButton: {
    backgroundColor: "#116530",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  addToCartText: { color: "white", fontSize: 18, fontWeight: "bold" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  error: { textAlign: "center", color: "red", fontSize: 16, marginTop: 20 },

  // Counter Section
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  counterButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#116530",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 8,
  },
  quantity: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#116530",
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginTop: 20 },
  similarProductsContainer: { marginTop: 10 },

  cardContainer: { marginTop: 20, marginBottom: 30 },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: { fontSize: 40, marginBottom: 5 },
  cardTitle: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  cardDescription: { fontSize: 14, color: "#666", textAlign: "center" },
});
