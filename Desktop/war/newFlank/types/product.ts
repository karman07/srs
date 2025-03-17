export interface Product {
    _id: string;
    name: string;
    price: string;
    weight: string;
    imageUrl: string;
    description:string;
    crusine: string;
  }
  
export interface CartItem extends Product {
  quantity: number;
}