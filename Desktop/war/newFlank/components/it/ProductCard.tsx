import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, NavigationProp } from "@react-navigation/native"; // ✅ Import NavigationProp
import { RootState } from "@/store/store";
import { addToCart, incrementQuantity, decrementQuantity } from "@/store/cartSlice";
import { RootStackParamList } from "@/app/BottomTabNavigator"; // ✅ Import navigation types

interface ProductCardProps {
  _id: string;
  name: string;
  price: string;
  weight: string;
  image: { uri: string };
  description: string;
  crusine: string;
}

export default function ProductCard({ _id, name, price, weight, image, description, crusine }: ProductCardProps) {
  const dispatch = useDispatch();
  
  // ✅ Correctly type the navigation instance
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const cartItem = useSelector((state: RootState) =>
    state.cart.cart.find((item) => item._id === _id)
  );

  // ✅ Correctly pass parameters to `navigate`
  const handleNavigate = () => {
    navigation.navigate("ProductView", { productId: _id });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleNavigate} activeOpacity={0.8}>
      <Image source={image} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.price}>${price}</Text>
      <Text style={styles.weight}>{weight}</Text>

      {cartItem ? (
        <View style={styles.counterContainer}>
          <TouchableOpacity style={styles.counterButton} onPress={() => dispatch(decrementQuantity(_id))}>
            <AntDesign name="minus" size={22} color="#116530" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{cartItem.quantity}</Text>
          <TouchableOpacity style={styles.counterButton} onPress={() => dispatch(incrementQuantity(_id))}>
            <AntDesign name="plus" size={22} color="#116530" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={(e) => {
            e.stopPropagation();
            dispatch(addToCart({ _id, name, price, weight, imageUrl: image.uri, quantity: 1, crusine, description }));
          }}
        >
          <AntDesign name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    width: 140,
    marginRight: 15,
    marginBottom: 10,
  },
  image: { width: 90, height: 90, borderRadius: 10, marginBottom: 10 },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#116530",
    marginBottom: 5,
  },
  weight: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#116530",
    padding: 7,
    borderRadius: 50,
    marginTop: 5,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  counterButton: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#116530",
    borderRadius: 10,
    padding: 5,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#116530",
    marginHorizontal: 5,
  },
});
