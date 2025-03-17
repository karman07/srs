import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import RazorpayCheckout from "react-native-razorpay";
import { removeFromCart, updateCartItem } from "@/store/cartSlice";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons"; // For back button icon

export default function OrderScreen() {
  const cartItems = useSelector((state: RootState) => state.cart.cart);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    tableNumber: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // Default: COD

  const handleChange = (field: string, value: string) => {
    setUserDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleUpdateQuantity = (id: string, type: "increase" | "decrease") => {
    const item = cartItems.find((item) => item._id === id);
    if (!item) return;

    const newQuantity =
      type === "increase" ? item.quantity + 1 : item.quantity - 1;
    if (newQuantity <= 0) {
      handleRemoveItem(id);
    } else {
      dispatch(updateCartItem({ id, quantity: newQuantity }));
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const gst = subtotal * 0.05; // 5% GST
  const totalPrice = subtotal + gst;

  const handlePayment = async () => {
    if (
      !userDetails.name ||
      !userDetails.email ||
      !userDetails.phone ||
      !userDetails.tableNumber
    ) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    const orderData = {
      user: userDetails,
      items: cartItems,
      total: totalPrice,
      paymentMethod,
    };

    if (paymentMethod === "cod") {
      Alert.alert("Order Placed", "Your order has been placed successfully.");
      return;
    }

    try {
      const { data } = await axios.post(
        "https://3288-2405-201-5809-7879-9cbe-e5c0-eab3-8e22.ngrok-free.app/payment/create-order",
        { amount: orderData.total }
      );

      const options = {
        description: "Food Order Payment",
        image: "C:\\Users\\Dell\\Desktop\\war\\newFlank\\assets\\images\\pic\\flag.png",
        currency: "INR",
        key: "rzp_test_TJOrQglqT6B38A",
        amount: Number(data.amount) * 100,
        name: "Restaurant",
        order_id: data.orderId,
        prefill: {
          email: userDetails.email,
          contact: userDetails.phone,
          name: userDetails.name,
        },
        theme: { color: "#FF6600" },
      };

      RazorpayCheckout.open(options)
        .then((paymentData: { razorpay_payment_id: string }) => {
          Alert.alert(
            "Payment Successful",
            `Payment ID: ${paymentData.razorpay_payment_id}`
          );
        })
        .catch(() => {
          Alert.alert("Payment Failed", "Please try again.");
        });
    } catch (error) {
      console.log(error);
      Alert.alert("Payment Error", "Unable to process payment. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* ✅ Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
      </View>

      <ScrollView style={styles.container}>
        {/* ✅ Cart Items */}
        <Text style={styles.sectionTitle}>🛒 Your Cart</Text>
        {cartItems.length === 0 ? (
          <Text style={styles.emptyCart}>Your cart is empty.</Text>
        ) : (
          cartItems.map((item) => (
            <View key={item._id} style={styles.cartItem}>
              <Text style={styles.cartItemText}>{item.name}</Text>
              <Text style={styles.cartItemPrice}>
                ₹{Number(item.price) * item.quantity}
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(item._id, "decrease")}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() => handleUpdateQuantity(item._id, "increase")}
                  style={styles.quantityButton}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemoveItem(item._id)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>❌</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ✅ Order Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>Subtotal: ₹{subtotal.toFixed(2)}</Text>
          <Text style={styles.summaryText}>GST (5%): ₹{gst.toFixed(2)}</Text>
          <Text style={styles.totalText}>Total: ₹{totalPrice.toFixed(2)}</Text>
        </View>

        {/* ✅ Place Order Button */}
        <TouchableOpacity style={styles.orderButton} onPress={handlePayment}>
          <Text style={styles.orderButtonText}>Place Order</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  emptyCart: { textAlign: "center", color: "#888", marginVertical: 10 },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  cartItemText: { fontSize: 16, flex: 1 },
  cartItemPrice: { fontSize: 16, fontWeight: "bold" },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    backgroundColor: "#fff",
    borderColor: "#116530",
    borderWidth: 1,
    borderRadius: 5,
    padding: 2,
    marginHorizontal: 5,
  },
  quantityButtonText: { fontSize: 20, marginLeft: 5, marginRight: 5, color: "#116530" },
  quantityText: { fontSize: 16, padding: 5, margin: 5 },
  removeButtonText: { fontSize: 16, color: "#f00" },
  orderButton: { backgroundColor: "#116530", padding: 15, borderRadius: 5, marginTop: 20 },
  orderButtonText: { fontSize: 18, color: "#fff", textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#116530", padding: 15 },
  backButton: { marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  summaryCard: { backgroundColor: "#f8f8f8", padding: 15, borderRadius: 8, marginVertical: 10 },
  summaryText: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  totalText: { fontSize: 18, fontWeight: "bold", color: "#116530", textAlign:"center" },
  removeButton: { 
    padding: 5, 
    borderRadius: 5, 
    alignItems: "center",
    justifyContent: "center",
  },
});
