import { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  ProductView: { productId: string }; // ✅ Define valid screens
};

export type ProductViewProps = NativeStackScreenProps<RootStackParamList, "ProductView">;
