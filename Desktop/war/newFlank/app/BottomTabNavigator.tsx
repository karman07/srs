import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./Main";
import Categ from "./Cate";
import Search from "./Search";
import OrderScreen from "./CartScreen";
import ProductViewScreen from "./ProductViewScreen"; // Import product screen
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

// ✅ Define navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  ProductView: { productId: string }; // ✅ Expect productId in route params
};

// ✅ Create typed Stack Navigator
const Stack = createStackNavigator<RootStackParamList>();

const Tab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#116530", height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Categories"
        component={Categ}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={OrderScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ✅ Main Navigation with Typed Stack
export default function AppNavigator() {
  return (
   
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen name="ProductView" component={ProductViewScreen} />
      </Stack.Navigator>
   
  );
}
