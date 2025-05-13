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
  boxes?: number;
  weightKg?: number; // Mantido como weightKg aqui, conforme o original
}

export interface Material {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  createdAt: string;
  updatedAt: string;
  boxes?: number;
  weightKg?: number;
}

export interface ProductFormData {
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  boxes?: number;      // Adicionado - use ? se for opcional no formulário
  weightKg?: number;  // Adicionado (snake_case para corresponder ao uso no modal e ao erro) - use ? se for opcional
}

export interface MaterialFormData {
  name: string;
  quantity: number;
  minQuantity: number;
  boxes?: number;
  weightKg?: number;
}
// ...existing code...
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