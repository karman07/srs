export interface Item {
    _id: string;
    name: string;
    calories?: number;
    price?: string;
    imageUrl?: string;
   // cuisine?: string;
    description: string;
   // category?:string;
    crusine?: string
  }

export interface Category {
    _id: string;
    name: string;
    description: string;
    imageUrl?: string;
    
  }

export interface Order {
    _id: string;
    customerName: string;
    customerEmail?: string;
    customerNumber: string;
    orderDetails?: string;
    menuItems: MenuItem[];
    totalPrice: number;
    status: string;
    orderDate: string;
    paymentStatus: string;
    paymentMethod: string;
    table: string;
    location?: {
      lat?: number;
      lng?: number;
    };
  }

export interface MenuItem {
    menuItemId: string;
    quantity: number;
  }