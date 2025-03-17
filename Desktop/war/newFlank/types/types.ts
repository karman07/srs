export interface Category {
    _id: string;
    name: string;
    imageUrl: string;
  }
  
  export interface Product {
    _id: string;
    name: string;
    price: string;
    weight: string;
    imageUrl: string;
    crusine: string;
    description:string;
  }

  export type RootStackParamList = {
    Home: undefined;
    Categories: undefined;
    Search: undefined;
    Cart: undefined;
  };
  