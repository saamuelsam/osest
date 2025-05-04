export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'estoque';
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
}

export interface MaterialFormData {
  name: string;
  quantity: number;
  minQuantity: number;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'estoque';
}

export interface StockAdjustment {
  quantity: number;
  type: 'add' | 'remove';
  description?: string;
}