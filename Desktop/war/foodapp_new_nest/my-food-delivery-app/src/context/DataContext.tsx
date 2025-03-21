import { createContext,  useContext, useEffect, useState } from 'react';
import { Category, Item, Order } from '../types/types';
import { BASE_URL_APP } from '../Base/baseurl';


interface DataContextType {
  heroes: Item[];
  categories: Category[];
  menuItems: Item[];
  loading: boolean;
  fetchHeroes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchMenuItems: () => Promise<void>;
  getMenuItemById: (id: string) => Promise<Item | null>;
  placeOrder: (order: Order) => Promise<void>;
  createPaymentOrder: (amount: number) => Promise<any>;
  totalPrice: number;
  setTotalPrice: (amount: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const BASE_URL = BASE_URL_APP;

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [heroes, setHeroes] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalPrice, setTotalPric] = useState(0);
  const fetchHeroes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/heroes`);
      if (!response.ok) throw new Error(`Failed to fetch heroes: ${response.status}`);
      const data = await response.json();
      setHeroes(data);
    } catch (error) {
      console.error('Error fetching heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTotalPrice = async (amount: number) => {
    // Update state or make an API call here
    setTotalPric(amount);
  };
  
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/category`);
      if (!response.ok) throw new Error(`Failed to fetch categories: ${response.status}`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/menu`);
      if (!response.ok) throw new Error(`Failed to fetch menu items: ${response.status}`);
      const data = await response.json();
    //  console.log(data)
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemById = async (id: string): Promise<Item | null> => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/menu/${id}`);
      if (!response.ok) throw new Error(`Failed to fetch menu item: ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async (order: Order) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error(`Failed to place order: ${response.status}`);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPaymentOrder = async (amount: number) => {
    try {
      const response = await fetch(`${BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) throw new Error(`Failed to create payment order: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchHeroes();
    fetchCategories();
    fetchMenuItems();
  }, []);

  return (
    <DataContext.Provider
      value={{
        heroes,
        categories,
        menuItems,
        loading,
        fetchHeroes,
        fetchCategories,
        fetchMenuItems,
        getMenuItemById,
        placeOrder,
        createPaymentOrder,
        totalPrice,
        setTotalPrice
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
