import { Product } from "@/types/types";
import axios from "axios";

const API_BASE_URL = "https://3288-2405-201-5809-7879-9cbe-e5c0-eab3-8e22.ngrok-free.app"; // 🔹 Replace with your actual API URL

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/category`);
   // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/menu`);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const fetchProductById = async (productId: string): Promise<Product> => {
  const response = await axios.get(`${API_BASE_URL}/menu/${productId}`);
  return response.data;
};

export const fetchProductsByCuisine = async (cuisine: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/menu?cuisine=${cuisine}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching similar products:", error);
    return [];
  }
};